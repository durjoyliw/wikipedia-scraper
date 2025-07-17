import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

class WikipediaAutoCrawler {
    constructor() {
        this.baseUrl = "https://en.wikipedia.org";
        this.delay = 2000; // 2 seconds between requests to be respectful
        this.outputDir = "crawled_pages";
        this.maxPages = 50; // Limit for testing - you can increase later
        this.crawledCount = 0;
        this.errors = [];
        this.masterIndex = [];
    }

    // Create output directory
    async setupOutputDirectory() {
        try {
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir);
                console.log(`📁 Created directory: ${this.outputDir}`);
            }
        } catch (error) {
            console.error(`❌ Error creating directory: ${error.message}`);
        }
    }

    // Extract all Wikipedia links from existing JSON files
    async extractLinksFromExistingData() {
        const allLinks = new Set(); // Use Set to avoid duplicates
        
        console.log("🔍 Looking for existing JSON files...");
        
        // Read all JSON files in current directory
        const files = fs.readdirSync('./').filter(file => file.endsWith('.json'));
        
        for (const file of files) {
            try {
                console.log(`📖 Reading: ${file}`);
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                
                if (data.tables && Array.isArray(data.tables)) {
                    data.tables.forEach(table => {
                        table.rows.forEach(row => {
                            if (row.wikipedia_links && Array.isArray(row.wikipedia_links)) {
                                row.wikipedia_links.forEach(link => {
                                    if (link.url && link.url.includes('/wiki/')) {
                                        allLinks.add(link.url);
                                    }
                                });
                            }
                            // Also check _links field (older format)
                            if (row._links && Array.isArray(row._links)) {
                                row._links.forEach(link => {
                                    if (link.url && link.url.includes('/wiki/')) {
                                        allLinks.add(link.url);
                                    }
                                });
                            }
                        });
                    });
                }
            } catch (error) {
                console.log(`⚠️ Could not read ${file}: ${error.message}`);
            }
        }
        
        const uniqueLinks = Array.from(allLinks);
        console.log(`🔗 Found ${uniqueLinks.length} unique Wikipedia links to crawl`);
        
        return uniqueLinks;
    }

    // Sleep function
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Clean filename for saving
    cleanFilename(title) {
        return title
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 100); // Limit length
    }

    // Scrape individual Wikipedia page
    async scrapeIndividualPage(url) {
        try {
            console.log(`🔄 Crawling: ${url}`);
            
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; WikiCrawler/1.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                timeout: 10000 // 10 second timeout
            });
            
            const $ = cheerio.load(data);
            
            // Extract comprehensive page data
            const pageData = {
                url: url,
                title: $('h1.firstHeading').text().trim(),
                summary: this.extractSummary($),
                infobox: this.extractInfobox($),
                sections: this.extractSections($),
                externalLinks: this.extractExternalLinks($),
                references: this.extractReferences($),
                categories: this.extractCategories($),
                coordinates: this.extractCoordinates($),
                scrapedAt: new Date().toISOString(),
                scrapedFrom: url
            };

            // Add to master index
            this.masterIndex.push({
                title: pageData.title,
                url: url,
                filename: this.cleanFilename(pageData.title),
                summary: pageData.summary.substring(0, 200),
                scrapedAt: pageData.scrapedAt
            });

            console.log(`✅ Successfully crawled: ${pageData.title}`);
            return pageData;

        } catch (error) {
            console.error(`❌ Error crawling ${url}: ${error.message}`);
            this.errors.push({ url, error: error.message });
            return null;
        }
    }

    // Extract page summary (first few paragraphs)
    extractSummary($) {
        const summaryParagraphs = [];
        $('#mw-content-text .mw-parser-output > p').slice(0, 3).each((index, p) => {
            const text = $(p).text().trim();
            if (text && text.length > 50) {
                summaryParagraphs.push(text);
            }
        });
        return summaryParagraphs.join('\n\n');
    }

    // Extract infobox data
    extractInfobox($) {
        const infobox = {};
        $('.infobox tr').each((index, row) => {
            const label = $(row).find('th').text().trim();
            const value = $(row).find('td').text().trim();
            if (label && value) {
                infobox[label] = value;
            }
        });
        return infobox;
    }

    // Extract main sections
    extractSections($) {
        const sections = [];
        $('#mw-content-text .mw-parser-output').children().each((index, element) => {
            const tagName = element.tagName?.toLowerCase();
            
            if (tagName && tagName.match(/^h[2-4]$/)) {
                const sectionTitle = $(element).text().trim();
                if (sectionTitle && !sectionTitle.includes('edit')) {
                    sections.push({
                        level: parseInt(tagName.charAt(1)),
                        title: sectionTitle,
                        content: []
                    });
                }
            } else if (sections.length > 0 && tagName === 'p') {
                const text = $(element).text().trim();
                if (text && text.length > 30) {
                    sections[sections.length - 1].content.push(text);
                }
            }
        });
        return sections;
    }

    // Extract external links
    extractExternalLinks($) {
        const externalLinks = [];
        $('#External_links, #External_Links').parent().nextAll('ul').find('a[href^="http"]').each((index, link) => {
            const url = $(link).attr('href');
            const text = $(link).text().trim();
            if (url && text) {
                externalLinks.push({ url, text });
            }
        });
        
        // Also check references section for external links
        $('.references a[href^="http"], .reflist a[href^="http"]').each((index, link) => {
            const url = $(link).attr('href');
            const text = $(link).text().trim();
            if (url && text && !externalLinks.some(existing => existing.url === url)) {
                externalLinks.push({ url, text, source: 'references' });
            }
        });
        
        return externalLinks;
    }

    // Extract references (simplified)
    extractReferences($) {
        const references = [];
        $('.references li, .reflist li').slice(0, 20).each((index, ref) => {
            const text = $(ref).text().trim();
            if (text && text.length > 10) {
                references.push({
                    number: index + 1,
                    text: text.substring(0, 300)
                });
            }
        });
        return references;
    }

    // Extract categories
    extractCategories($) {
        const categories = [];
        $('#mw-normal-catlinks a').each((index, cat) => {
            const category = $(cat).text().trim();
            if (category && !category.includes('Category:')) {
                categories.push(category);
            }
        });
        return categories;
    }

    // Extract coordinates if available
    extractCoordinates($) {
        const coords = $('.geo').text().trim();
        return coords || null;
    }

    // Save individual page data
    async savePageData(pageData) {
        try {
            const filename = `${this.cleanFilename(pageData.title)}.json`;
            const filepath = path.join(this.outputDir, filename);
            
            await fs.promises.writeFile(filepath, JSON.stringify(pageData, null, 2));
            console.log(`💾 Saved: ${filename}`);
            
        } catch (error) {
            console.error(`❌ Error saving ${pageData.title}: ${error.message}`);
        }
    }

    // Save master index
    async saveMasterIndex() {
        try {
            const indexData = {
                totalPages: this.crawledCount,
                successfulPages: this.masterIndex.length,
                errors: this.errors.length,
                crawledAt: new Date().toISOString(),
                pages: this.masterIndex,
                errorLog: this.errors
            };
            
            await fs.promises.writeFile(
                path.join(this.outputDir, 'MASTER_INDEX.json'), 
                JSON.stringify(indexData, null, 2)
            );
            
            // Also create a CSV index
            let csvContent = 'Title,URL,Filename,Summary,Scraped_At\n';
            this.masterIndex.forEach(page => {
                const summary = page.summary.replace(/"/g, '""').replace(/\n/g, ' ');
                csvContent += `"${page.title}","${page.url}","${page.filename}","${summary}","${page.scrapedAt}"\n`;
            });
            
            await fs.promises.writeFile(
                path.join(this.outputDir, 'MASTER_INDEX.csv'), 
                csvContent
            );
            
            console.log(`📋 Master index saved with ${this.masterIndex.length} pages`);
            
        } catch (error) {
            console.error(`❌ Error saving master index: ${error.message}`);
        }
    }

    // Main crawling function
    async startCrawling() {
        console.log("🚀 Starting Wikipedia Auto-Crawler...");
        
        // Setup
        await this.setupOutputDirectory();
        
        // Get links to crawl
        const linksToCheck = await this.extractLinksFromExistingData();
        
        if (linksToCheck.length === 0) {
            console.log("❌ No Wikipedia links found in existing JSON files!");
            return;
        }
        
        // Limit for testing
        const linksToCrawl = linksToCheck.slice(0, this.maxPages);
        console.log(`🎯 Will crawl ${linksToCrawl.length} pages (limited to ${this.maxPages} for testing)`);
        
        // Start crawling
        for (let i = 0; i < linksToCrawl.length; i++) {
            const url = linksToCrawl[i];
            
            console.log(`\n📊 Progress: ${i + 1}/${linksToCrawl.length}`);
            
            const pageData = await this.scrapeIndividualPage(url);
            
            if (pageData) {
                await this.savePageData(pageData);
                this.crawledCount++;
            }
            
            // Respectful delay
            if (i < linksToCrawl.length - 1) {
                console.log(`⏳ Waiting ${this.delay/1000} seconds...`);
                await this.sleep(this.delay);
            }
        }
        
        // Save master index
        await this.saveMasterIndex();
        
        // Final summary
        console.log("\n" + "=".repeat(60));
        console.log("🎉 AUTO-CRAWLING COMPLETED!");
        console.log("=".repeat(60));
        console.log(`✅ Successfully crawled: ${this.crawledCount} pages`);
        console.log(`❌ Errors encountered: ${this.errors.length}`);
        console.log(`📁 Files saved in: ${this.outputDir}/`);
        console.log(`📋 Master index: ${this.outputDir}/MASTER_INDEX.json`);
        console.log(`📊 CSV index: ${this.outputDir}/MASTER_INDEX.csv`);
        console.log("=".repeat(60));
    }
}

// Start the auto-crawler
const crawler = new WikipediaAutoCrawler();

// You can adjust these settings:
crawler.maxPages = 200; // Start with 20 pages for testing
crawler.delay = 3000; // 3 seconds between requests

// Start crawling
crawler.startCrawling().catch(error => {
    console.error("❌ Crawler error:", error.message);
});
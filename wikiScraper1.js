import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

class ImprovedWikipediaScraper {
    constructor() {
        this.baseUrl = "https://en.wikipedia.org";
        this.delay = 1000;
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async scrapePage(url) {
        try {
            console.log(`Scraping: ${url}`);
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; WikiScraper/1.0)'
                }
            });
            
            const $ = cheerio.load(data);
            
            const result = {
                url: url,
                title: $('h1.firstHeading').text().trim(),
                scrapedAt: new Date().toISOString(),
                tables: [],
                allReferences: this.extractAllReferences($),
                links: {
                    internal: [],
                    external: []
                }
            };

            // Extract tables with improved reference resolution
            $('table.wikitable').each((index, table) => {
                const tableData = {
                    index: index,
                    headers: [],
                    rows: []
                };

                // Get headers
                $(table).find('tr').first().find('th').each((i, th) => {
                    const headerText = $(th).text().trim().replace(/\n/g, ' ');
                    if (headerText) {
                        tableData.headers.push(headerText);
                    }
                });

                // Get data rows
                $(table).find('tr').slice(1).each((rowIndex, row) => {
                    const cells = $(row).find('td');
                    if (cells.length > 0) {
                        const rowData = {};
                        const rowWikiLinks = [];
                        const rowExternalRefs = [];

                        cells.each((cellIndex, cell) => {
                            // Get cell text
                            const cellText = $(cell).text().trim().replace(/\n/g, ' ');
                            const headerName = tableData.headers[cellIndex] || `column_${cellIndex}`;
                            rowData[headerName] = cellText;

                            // Extract Wikipedia links
                            $(cell).find('a[href^="/wiki/"]').each((_, link) => {
                                const href = $(link).attr('href');
                                const linkText = $(link).text().trim();
                                rowWikiLinks.push({
                                    url: this.baseUrl + href,
                                    text: linkText
                                });
                            });

                            // Extract and resolve reference numbers [1], [2], etc.
                            const referenceMatches = cellText.match(/\[(\d+)\]/g);
                            if (referenceMatches) {
                                referenceMatches.forEach(match => {
                                    const refNum = match.replace(/[\[\]]/g, '');
                                    const externalUrl = this.resolveReference(refNum, result.allReferences);
                                    if (externalUrl) {
                                        rowExternalRefs.push({
                                            referenceNumber: refNum,
                                            url: externalUrl.url,
                                            title: externalUrl.title || `Reference ${refNum}`,
                                            context: externalUrl.context || ''
                                        });
                                    }
                                });
                            }
                        });

                        rowData['wikipedia_links'] = rowWikiLinks;
                        rowData['external_references'] = rowExternalRefs;
                        tableData.rows.push(rowData);
                    }
                });

                if (tableData.headers.length > 0) {
                    result.tables.push(tableData);
                }
            });

            console.log(`✅ Successfully scraped: ${result.title}`);
            console.log(`📊 Tables: ${result.tables.length}`);
            console.log(`📚 Total references found: ${result.allReferences.length}`);

            return result;

        } catch (error) {
            console.error(`❌ Error scraping ${url}:`, error.message);
            return null;
        }
    }

    // IMPROVED: Extract all references from the page with better resolution
    extractAllReferences($) {
        const references = [];
        
        // Method 1: Look for references in multiple locations
        const referenceSelectors = [
            'ol.references li',
            '.reflist li', 
            '.references li',
            'div.reflist li',
            'ol li[id*="cite_note"]'
        ];
        
        referenceSelectors.forEach(selector => {
            $(selector).each((index, ref) => {
                const refId = $(ref).attr('id');
                const refText = $(ref).text().trim();
                
                if (refId && refText && !references.find(r => r.id === refId)) {
                    const refData = this.processReference($, ref, refId, refText);
                    if (refData) {
                        references.push(refData);
                    }
                }
            });
        });

        // Method 2: Look for references by ID pattern (more thorough)
        $('[id*="cite_note-"]').each((index, ref) => {
            const refId = $(ref).attr('id');
            const refText = $(ref).text().trim();
            
            if (refId && refText && !references.find(r => r.id === refId)) {
                const refData = this.processReference($, ref, refId, refText);
                if (refData) {
                    references.push(refData);
                }
            }
        });

        console.log(`📚 Extracted ${references.length} references using improved method`);
        return references.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    }

    // IMPROVED: Process individual reference with multiple URL extraction methods
    processReference($, ref, refId, refText) {
        const externalUrls = [];
        
        // Method 1: Direct links in the reference
        $(ref).find('a[href]').each((_, link) => {
            const href = $(link).attr('href');
            if (href && href.startsWith('http')) {
                externalUrls.push({
                    url: href,
                    text: $(link).text().trim() || 'External Link',
                    method: 'direct_link'
                });
            }
        });

        // Method 2: Look for URLs in span.reference-text
        $(ref).find('span.reference-text, .reference-text').each((_, span) => {
            $(span).find('a[href]').each((_, link) => {
                const href = $(link).attr('href');
                if (href && href.startsWith('http')) {
                    externalUrls.push({
                        url: href,
                        text: $(link).text().trim() || 'Reference Link',
                        method: 'span_reference'
                    });
                }
            });
        });

        // Method 3: Look for URLs in cite elements
        $(ref).find('cite a[href], .citation a[href]').each((_, link) => {
            const href = $(link).attr('href');
            if (href && href.startsWith('http')) {
                externalUrls.push({
                    url: href,
                    text: $(link).text().trim() || 'Citation Link',
                    method: 'citation'
                });
            }
        });

        // Method 4: Extract URLs from plain text using regex
        const urlMatches = refText.match(/https?:\/\/[^\s\[\]()]+/g);
        if (urlMatches) {
            urlMatches.forEach(url => {
                // Clean up the URL
                const cleanUrl = url.replace(/[,;.\])}]+$/, '');
                if (!externalUrls.find(u => u.url === cleanUrl)) {
                    externalUrls.push({
                        url: cleanUrl,
                        text: 'Plain Text URL',
                        method: 'regex_extraction'
                    });
                }
            });
        }

        // Method 5: Look for archived URLs (common in Wikipedia)
        const archiveMatches = refText.match(/Archived from the original on.*?https?:\/\/[^\s\[\]()]+/g);
        if (archiveMatches) {
            archiveMatches.forEach(match => {
                const urlMatch = match.match(/https?:\/\/[^\s\[\]()]+/);
                if (urlMatch) {
                    const cleanUrl = urlMatch[0].replace(/[,;.\])}]+$/, '');
                    if (!externalUrls.find(u => u.url === cleanUrl)) {
                        externalUrls.push({
                            url: cleanUrl,
                            text: 'Archived URL',
                            method: 'archive_extraction'
                        });
                    }
                }
            });
        }

        // Extract reference number
        const refNumber = refId.match(/cite_note-(\d+)/);
        if (refNumber) {
            // Remove duplicates and pick the best URL
            const uniqueUrls = externalUrls.filter((url, index, self) => 
                index === self.findIndex(u => u.url === url.url)
            );

            return {
                number: refNumber[1],
                id: refId,
                text: refText,
                externalUrls: uniqueUrls,
                url: uniqueUrls.length > 0 ? uniqueUrls[0].url : null,
                title: uniqueUrls.length > 0 ? uniqueUrls[0].text : null,
                context: refText.substring(0, 300),
                extractionMethods: uniqueUrls.map(u => u.method).join(', ')
            };
        }

        return null;
    }

    // Resolve a reference number to external URL
    resolveReference(refNum, allReferences) {
        return allReferences.find(ref => ref.number === refNum);
    }

    async saveToFile(data, filename) {
        try {
            await fs.promises.writeFile(filename, JSON.stringify(data, null, 2));
            console.log(`💾 Data saved to ${filename}`);
        } catch (error) {
            console.error(`❌ Error saving to file: ${error.message}`);
        }
    }

    // IMPROVED CSV export with better reference information
    async saveToImprovedCSV(data, filename) {
        try {
            if (!data.tables || data.tables.length === 0) {
                console.log('⚠️ No tables found to convert to CSV');
                return;
            }

            let csvContent = '';
            
            data.tables.forEach((table, tableIndex) => {
                csvContent += `\n=== TABLE ${tableIndex + 1}: ${data.title} ===\n`;
                
                // Create enhanced headers
                const baseHeaders = table.headers;
                const fullHeaders = [...baseHeaders, 'Wikipedia_Links', 'External_Sources_Count', 'External_URLs', 'Extraction_Methods'];
                csvContent += fullHeaders.join(',') + '\n';
                
                // Add rows with enhanced reference information
                table.rows.forEach(row => {
                    const values = [];
                    
                    // Add base data
                    baseHeaders.forEach(header => {
                        const value = row[header] || '';
                        values.push(`"${value.replace(/"/g, '""')}"`);
                    });
                    
                    // Add Wikipedia links
                    const wikiLinks = row.wikipedia_links || [];
                    const wikiLinkStr = wikiLinks.map(link => `${link.text}: ${link.url}`).join(' | ');
                    values.push(`"${wikiLinkStr}"`);
                    
                    // Add external references count and details
                    const extRefs = row.external_references || [];
                    values.push(`"${extRefs.length}"`);
                    
                    // Add actual external URLs with reference numbers
                    const extUrlsStr = extRefs.map(ref => {
                        const urlPart = ref.url || 'No URL found';
                        return `[${ref.referenceNumber}] ${urlPart}`;
                    }).join(' | ');
                    values.push(`"${extUrlsStr}"`);
                    
                    // Add extraction methods used
                    const methodsStr = extRefs.map(ref => 
                        `[${ref.referenceNumber}] ${ref.extractionMethods || 'N/A'}`
                    ).join(' | ');
                    values.push(`"${methodsStr}"`);
                    
                    csvContent += values.join(',') + '\n';
                });
                
                csvContent += '\n';
            });

            await fs.promises.writeFile(filename, csvContent);
            console.log(`📊 Enhanced CSV saved to ${filename}`);
        } catch (error) {
            console.error(`❌ Error saving CSV: ${error.message}`);
        }
    }

    // Create a summary report
    async createSummaryReport(data, filename) {
        try {
            let report = `WIKIPEDIA SCRAPING REPORT\n`;
            report += `================================\n\n`;
            report += `Page: ${data.title}\n`;
            report += `URL: ${data.url}\n`;
            report += `Scraped: ${data.scrapedAt}\n\n`;
            
            report += `SUMMARY:\n`;
            report += `- Tables found: ${data.tables.length}\n`;
            report += `- Total references: ${data.allReferences.length}\n`;
            
            let totalRows = 0;
            let totalWikiLinks = 0;
            let totalExternalRefs = 0;
            
            data.tables.forEach((table, index) => {
                totalRows += table.rows.length;
                table.rows.forEach(row => {
                    totalWikiLinks += (row.wikipedia_links || []).length;
                    totalExternalRefs += (row.external_references || []).length;
                });
                
                report += `\nTable ${index + 1}: ${table.rows.length} rows\n`;
                report += `Headers: ${table.headers.join(', ')}\n`;
            });
            
            report += `\nTOTALS:\n`;
            report += `- Total rows: ${totalRows}\n`;
            report += `- Total Wikipedia links: ${totalWikiLinks}\n`;
            report += `- Total external references: ${totalExternalRefs}\n`;
            
            report += `\nEXTERNAL REFERENCES FOUND:\n`;
            data.allReferences.forEach((ref, index) => {
                if (ref.url) {
                    report += `[${ref.number}] ${ref.url}\n`;
                }
            });

            await fs.promises.writeFile(filename, report);
            console.log(`📋 Summary report saved to ${filename}`);
        } catch (error) {
            console.error(`❌ Error creating report: ${error.message}`);
        }
    }
}

// Test the improved scraper
console.log("🚀 Starting IMPROVED scraper test...");
const scraper = new ImprovedWikipediaScraper();
const testUrl = "https://en.wikipedia.org/wiki/List_of_accidents_and_incidents_involving_commercial_aircraft";
scraper.scrapePage(testUrl).then(result => {
    if (result) {
        // TEMPORARY DIAGNOSTIC - add this right after the scrapePage call
        console.log("\n🔍 DIAGNOSTIC: What did we find on this page?");
        console.log(`Page title: ${result.title}`);
        console.log(`Total links found: ${result.links ? result.links.internal.length + result.links.external.length : 0}`);

        console.log("\n🎉 Improved scraping completed!");
        
        // Generate unique filenames based on page title
        const cleanTitle = result.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Save files with unique names
        scraper.saveToFile(result, `${cleanTitle}_${timestamp}.json`);
        scraper.saveToImprovedCSV(result, `${cleanTitle}_${timestamp}.csv`);
        scraper.createSummaryReport(result, `${cleanTitle}_${timestamp}_report.txt`);
        
        // FINAL SUMMARY
        console.log("\n" + "=".repeat(50));
        console.log("📋 FINAL SCRAPING SUMMARY");
        console.log("=".repeat(50));
        console.log(`✅ Successfully scraped: ${result.title}`);
        console.log(`📊 Tables extracted: ${result.tables.length}`);
        console.log(`📚 References processed: ${result.allReferences.length}`);
        console.log(`🔗 External URLs found: ${result.allReferences.filter(r => r.url).length}`);
        console.log(`📄 Files created:`);
        console.log(`   - ${cleanTitle}_${timestamp}.json (complete data)`);
        console.log(`   - ${cleanTitle}_${timestamp}.csv (Excel-ready)`);
        console.log(`   - ${cleanTitle}_${timestamp}_report.txt (summary report)`);
        console.log("\n✅ Data ready for analysis and further processing!");
        console.log("=".repeat(50));
    }
}).catch(error => {
    console.log("❌ Error:", error.message);
});


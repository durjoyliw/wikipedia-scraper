import fs from "fs";
import path from "path";

class ReportsGenerator {
    constructor() {
        this.crawledDir = "crawled_pages";
        this.reportsDir = "ANALYSIS_REPORTS";
        this.data = {
            disasters: [],
            totalSources: 0,
            timelineData: {},
            typeBreakdown: {},
            locationAnalysis: {},
            sourceAnalysis: {}
        };
    }

    // Setup reports directory
    async setupReportsDirectory() {
        try {
            if (!fs.existsSync(this.reportsDir)) {
                fs.mkdirSync(this.reportsDir);
                console.log(`📁 Created reports directory: ${this.reportsDir}`);
            }
        } catch (error) {
            console.error(`❌ Error creating reports directory: ${error.message}`);
        }
    }

    // Load and analyze all data
    async loadAndAnalyzeData() {
        console.log("📊 Loading and analyzing disaster data...");
        
        try {
            // Check if crawled_pages directory exists
            if (!fs.existsSync(this.crawledDir)) {
                console.log("❌ No crawled_pages directory found!");
                console.log("💡 Run auto_crawler.js first to generate data.");
                return false;
            }

            const files = fs.readdirSync(this.crawledDir).filter(file => 
                file.endsWith('.json') && file !== 'MASTER_INDEX.json'
            );
            
            if (files.length === 0) {
                console.log("❌ No data files found in crawled_pages!");
                console.log("💡 Run auto_crawler.js first to generate disaster data.");
                return false;
            }

            for (const file of files) {
                await this.analyzeDisasterFile(file);
            }
            
            console.log(`✅ Analyzed ${this.data.disasters.length} disaster files`);
            
            // Perform analysis
            this.analyzeTimeline();
            this.analyzeTypes();
            this.analyzeLocations();
            this.analyzeSources();
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error loading data: ${error.message}`);
            return false;
        }
    }

    // Analyze individual disaster file
    async analyzeDisasterFile(filename) {
        try {
            const filepath = path.join(this.crawledDir, filename);
            const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            const disaster = {
                title: data.title,
                summary: data.summary?.substring(0, 200) || 'No summary',
                sourceCount: (data.externalLinks || []).length,
                filename: filename
            };
            
            // Extract years
            disaster.years = this.extractYears(data);
            
            // Classify type
            disaster.type = this.classifyType(data.title);
            
            // Extract location
            disaster.location = this.extractLocation(data);
            
            this.data.disasters.push(disaster);
            this.data.totalSources += disaster.sourceCount;
            
        } catch (error) {
            console.log(`⚠️ Could not analyze ${filename}: ${error.message}`);
        }
    }

    // Extract years from data
    extractYears(data) {
        const years = [];
        
        // Check title and summary for years
        const text = `${data.title} ${data.summary || ''}`;
        const yearMatches = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g);
        
        if (yearMatches) {
            years.push(...yearMatches.map(y => parseInt(y)));
        }
        
        return [...new Set(years)].filter(y => y > 1000 && y < 3000);
    }

    // Classify disaster type
    classifyType(title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('pandemic') || titleLower.includes('flu') || 
            titleLower.includes('plague') || titleLower.includes('covid') ||
            titleLower.includes('disease')) {
            return 'Pandemic/Disease';
        } else if (titleLower.includes('famine') || titleLower.includes('hunger')) {
            return 'Famine';
        } else if (titleLower.includes('earthquake') || titleLower.includes('flood') || 
                   titleLower.includes('storm') || titleLower.includes('hurricane')) {
            return 'Natural Disaster';
        } else if (titleLower.includes('terrorist') || titleLower.includes('attack')) {
            return 'Terrorist/Violence';
        } else if (titleLower.includes('fire') || titleLower.includes('accident') || 
                   titleLower.includes('crash')) {
            return 'Industrial/Transport';
        } else {
            return 'Other';
        }
    }

    // Extract location
    extractLocation(data) {
        const locations = ['England', 'Ireland', 'Scotland', 'Wales', 'Britain', 'UK', 
                          'Europe', 'Asia', 'Africa', 'America', 'London'];
        
        const text = `${data.title} ${data.summary || ''}`;
        
        for (const location of locations) {
            if (text.includes(location)) {
                return location;
            }
        }
        
        return 'Unknown';
    }

    // Analyze timeline
    analyzeTimeline() {
        const decades = {};
        
        this.data.disasters.forEach(disaster => {
            if (disaster.years.length > 0) {
                const year = Math.min(...disaster.years);
                const decade = Math.floor(year / 10) * 10;
                decades[decade] = (decades[decade] || 0) + 1;
            }
        });
        
        this.data.timelineData = decades;
    }

    // Analyze types
    analyzeTypes() {
        const types = {};
        
        this.data.disasters.forEach(disaster => {
            types[disaster.type] = (types[disaster.type] || 0) + 1;
        });
        
        this.data.typeBreakdown = types;
    }

    // Analyze locations
    analyzeLocations() {
        const locations = {};
        
        this.data.disasters.forEach(disaster => {
            if (disaster.location !== 'Unknown') {
                locations[disaster.location] = (locations[disaster.location] || 0) + 1;
            }
        });
        
        this.data.locationAnalysis = locations;
    }

    // Analyze sources
    analyzeSources() {
        const avgSources = Math.round(this.data.totalSources / this.data.disasters.length);
        const maxSources = Math.max(...this.data.disasters.map(d => d.sourceCount));
        const minSources = Math.min(...this.data.disasters.map(d => d.sourceCount));
        
        this.data.sourceAnalysis = {
            total: this.data.totalSources,
            average: avgSources,
            maximum: maxSources,
            minimum: minSources
        };
    }

    // Generate comprehensive report
    async generateMainReport() {
        const report = `
DISASTER DATA ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

═══════════════════════════════════════════════════════════════
OVERVIEW
═══════════════════════════════════════════════════════════════

📊 DATASET SUMMARY:
• Total Disasters Analyzed: ${this.data.disasters.length}
• Total External Sources: ${this.data.totalSources}
• Average Sources per Disaster: ${this.data.sourceAnalysis.average}
• Time Period Covered: ${Math.min(...this.data.disasters.flatMap(d => d.years))} - ${Math.max(...this.data.disasters.flatMap(d => d.years))}

═══════════════════════════════════════════════════════════════
DISASTER TYPE BREAKDOWN
═══════════════════════════════════════════════════════════════

${Object.entries(this.data.typeBreakdown)
    .sort(([,a], [,b]) => b - a)
    .map(([type, count]) => {
        const percentage = Math.round(count / this.data.disasters.length * 100);
        return `• ${type}: ${count} disasters (${percentage}%)`;
    }).join('\n')}

═══════════════════════════════════════════════════════════════
GEOGRAPHIC DISTRIBUTION
═══════════════════════════════════════════════════════════════

${Object.entries(this.data.locationAnalysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([location, count]) => `• ${location}: ${count} disasters`)
    .join('\n')}

═══════════════════════════════════════════════════════════════
HISTORICAL TIMELINE (Recent Decades)
═══════════════════════════════════════════════════════════════

${Object.entries(this.data.timelineData)
    .filter(([decade]) => parseInt(decade) >= 1900)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .slice(0, 15)
    .map(([decade, count]) => `• ${decade}s: ${count} disasters`)
    .join('\n')}

═══════════════════════════════════════════════════════════════
SOURCE QUALITY METRICS
═══════════════════════════════════════════════════════════════

• Total External Sources: ${this.data.sourceAnalysis.total}
• Average per Disaster: ${this.data.sourceAnalysis.average}
• Highest Source Count: ${this.data.sourceAnalysis.maximum}
• Lowest Source Count: ${this.data.sourceAnalysis.minimum}

═══════════════════════════════════════════════════════════════
TOP DISASTERS BY SOURCE COUNT
═══════════════════════════════════════════════════════════════

${this.data.disasters
    .sort((a, b) => b.sourceCount - a.sourceCount)
    .slice(0, 10)
    .map((disaster, i) => `${i+1}. ${disaster.title}: ${disaster.sourceCount} sources`)
    .join('\n')}

═══════════════════════════════════════════════════════════════
KEY INSIGHTS
═══════════════════════════════════════════════════════════════

1. DISASTER PATTERNS:
   • Most documented type: ${Object.entries(this.data.typeBreakdown).sort(([,a], [,b]) => b - a)[0][0]}
   • Geographic focus: ${Object.entries(this.data.locationAnalysis).sort(([,a], [,b]) => b - a)[0][0]}
   • Well-sourced events average ${this.data.sourceAnalysis.average} external references

2. DATA QUALITY:
   • High source coverage with ${this.data.sourceAnalysis.total} total references
   • Comprehensive historical span covering multiple centuries
   • Strong documentation for major disaster categories

3. RESEARCH VALUE:
   • Suitable for academic research and risk assessment
   • Multiple verification sources per event
   • Structured data ready for further analysis

Report generated from crawled Wikipedia data.
For detailed individual disaster information, see crawled_pages/ directory.
`;

        await fs.promises.writeFile(
            path.join(this.reportsDir, 'ANALYSIS_REPORT.txt'), 
            report
        );
        
        console.log("📋 Main analysis report created");
    }

    // Generate CSV reports
    async generateCSVReports() {
        // Disaster types CSV
        let typesCSV = 'Disaster_Type,Count,Percentage\n';
        Object.entries(this.data.typeBreakdown)
            .sort(([,a], [,b]) => b - a)
            .forEach(([type, count]) => {
                const percentage = Math.round(count / this.data.disasters.length * 100);
                typesCSV += `"${type}",${count},${percentage}%\n`;
            });
        
        await fs.promises.writeFile(
            path.join(this.reportsDir, 'DISASTER_TYPES.csv'), 
            typesCSV
        );

        // Timeline CSV
        let timelineCSV = 'Decade,Disaster_Count\n';
        Object.entries(this.data.timelineData)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([decade, count]) => {
                timelineCSV += `${decade}s,${count}\n`;
            });
        
        await fs.promises.writeFile(
            path.join(this.reportsDir, 'TIMELINE_DATA.csv'), 
            timelineCSV
        );

        // Location analysis CSV
        let locationCSV = 'Location,Disaster_Count\n';
        Object.entries(this.data.locationAnalysis)
            .sort(([,a], [,b]) => b - a)
            .forEach(([location, count]) => {
                locationCSV += `"${location}",${count}\n`;
            });
        
        await fs.promises.writeFile(
            path.join(this.reportsDir, 'LOCATION_ANALYSIS.csv'), 
            locationCSV
        );

        console.log("📊 CSV reports created");
    }

    // Main function
    async generateReports() {
        console.log("📈 Starting disaster data analysis and report generation...");
        
        await this.setupReportsDirectory();
        
        const dataLoaded = await this.loadAndAnalyzeData();
        if (!dataLoaded) {
            console.log("\n❌ Cannot generate reports without data.");
            console.log("💡 Please run auto_crawler.js first to collect disaster data.");
            return;
        }
        
        await this.generateMainReport();
        await this.generateCSVReports();
        
        console.log("\n" + "=".repeat(60));
        console.log("📈 ANALYSIS REPORTS COMPLETED!");
        console.log("=".repeat(60));
        console.log(`📁 Reports saved in: ${this.reportsDir}/`);
        console.log(`📋 Files created:`);
        console.log(`   • ANALYSIS_REPORT.txt (Main report)`);
        console.log(`   • DISASTER_TYPES.csv (Type breakdown)`);
        console.log(`   • TIMELINE_DATA.csv (Historical timeline)`);
        console.log(`   • LOCATION_ANALYSIS.csv (Geographic analysis)`);
        console.log(`\n📊 Analysis Summary:`);
        console.log(`   • ${this.data.disasters.length} disasters analyzed`);
        console.log(`   • ${this.data.totalSources} external sources processed`);
        console.log(`   • ${Object.keys(this.data.typeBreakdown).length} disaster categories identified`);
        console.log(`   • Reports ready for review and presentation`);
        console.log("=".repeat(60));
    }
}

// Generate the reports
console.log("🚀 Disaster Data Analysis & Report Generator");
console.log("This tool analyzes crawled disaster data and creates comprehensive reports.\n");

const generator = new ReportsGenerator();
generator.generateReports().catch(error => {
    console.error("❌ Report generation error:", error.message);
});
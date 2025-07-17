# Wikipedia Disaster Data Collection Tools

A comprehensive toolkit for scraping, crawling, and analyzing Wikipedia disaster data with professional reporting capabilities.

## 🚀 Quick Start

**Just want to view data?** → Open any `.csv` file in Excel  
**Want to collect data?** → Choose your category below

## 📂 File Categories & When to Use

### 📄 **Category 1: Single Page Scraping**
**File:** `wikiScraper1.js`  
**When to use:** You need data from ONE specific Wikipedia page  
**Perfect for:** Testing, small projects, specific page analysis

```bash
# Edit the URL in the file, then run:
node wikiScraper1.js
```

**Example use cases:**
- "I need data from the UK disasters page"
- "I want to scrape one specific Wikipedia list"
- "I'm testing the scraper on a new page type"

---

### 🕷️ **Category 2: Mass Crawling** 
**File:** `auto_crawler.js`  
**When to use:** You want detailed data from hundreds of individual pages  
**Perfect for:** Comprehensive research, building large datasets

```bash
# Must run Category 1 first, then:
node auto_crawler.js
```

**Example use cases:**
- "I want detailed info on every disaster mentioned"
- "I need comprehensive data for research/analysis"
- "I want individual files for each disaster event"

---

### 📊 **Category 3: Professional Packaging & Analysis**
**Files:** `generate_reports.js` + `create_client_package.js`  
**When to use:** You need professional reports and delivery packages  
**Perfect for:** Client deliverables, presentations, stakeholder reports

```bash
# Must run Category 2 first, then:
node generate_reports.js      # Creates analysis reports
node create_client_package.js # Creates professional package
```

**Example use cases:**
- "I need to present findings to stakeholders"
- "I want professional documentation for delivery"
- "I need statistical analysis and insights"

## 🎯 Common Workflows

### **Quick Test (5 minutes)**
1. Edit URL in `wikiScraper1.js`
2. Run `node wikiScraper1.js`
3. Check the generated CSV files

### **Complete Research Project (30-60 minutes)**
1. Edit URL in `wikiScraper1.js` → Run it
2. Run `node auto_crawler.js` (collects detailed data)
3. Run `node generate_reports.js` (creates analysis)
4. Run `node create_client_package.js` (professional package)

### **Data Analysis Only**
1. Use existing CSV files from previous runs
2. Run `node generate_reports.js` for new insights

## ⚡ Prerequisites

| Category | Prerequisites | Output |
|----------|---------------|---------|
| **Category 1** | None | Basic data from one page |
| **Category 2** | Category 1 data | Detailed individual files |
| **Category 3** | Category 2 data | Professional reports |

## 🛠️ Setup Requirements

**Essential:**
- Node.js (download from nodejs.org)
- Run `npm install` in project folder

**Optional:**
- Excel for viewing CSV files
- Text editor for modifying URLs

## 📁 What Each Tool Creates

### `wikiScraper1.js` Output:
```
✅ PageName_2025-07-16.json      # Complete data
✅ PageName_2025-07-16.csv       # Excel-ready tables  
✅ PageName_2025-07-16_report.txt # Summary
```

### `auto_crawler.js` Output:
```
📁 crawled_pages/
  ├── Black_Death.json           # Individual disaster files
  ├── Great_Famine_Ireland.json  # (200+ files)
  ├── MASTER_INDEX.csv           # Complete catalog
  └── MASTER_INDEX.json          # Technical format
```

### `generate_reports.js` Output:
```
📁 ANALYSIS_REPORTS/
  ├── ANALYSIS_REPORT.txt        # Main insights
  ├── DISASTER_TYPES.csv         # Category breakdown
  ├── TIMELINE_DATA.csv          # Historical analysis
  └── LOCATION_ANALYSIS.csv      # Geographic data
```

### `create_client_package.js` Output:
```
📁 CLIENT_DELIVERY_PACKAGE/
  ├── EXECUTIVE_SUMMARY.txt      # Professional overview
  ├── USER_GUIDE.txt             # How to use data
  ├── SAMPLE_EVENTS.csv          # Quick preview
  └── MASTER_INDEX.csv           # Complete catalog
```

## 🎯 Decision Guide

**Choose your starting point:**

| Your Goal | Start With | Then Use |
|-----------|------------|----------|
| "I need data from one Wikipedia page" | Category 1 | Stop here |
| "I want comprehensive disaster research" | Category 1 | → Category 2 → Category 3 |
| "I need professional deliverables" | Category 1 | → Category 2 → Category 3 |
| "I want to analyze existing data" | - | Category 3 only |
| "I'm testing the tools" | Category 1 | Stop here |

## 🔧 Quick Configuration

**To change target Wikipedia page:**
1. Open `wikiScraper1.js` in text editor
2. Find: `const testUrl = "https://en.wikipedia.org/wiki/..."`
3. Replace with your desired Wikipedia URL
4. Save and run

**To adjust crawling speed:**
1. Open `auto_crawler.js` in text editor  
2. Find: `crawler.maxPages = 20` (change number)
3. Find: `crawler.delay = 3000` (change delay in milliseconds)

## ⚠️ Important Notes

- **Run tools in order:** Category 1 → Category 2 → Category 3
- **Internet required:** Tools scrape live Wikipedia data
- **Respectful delays:** Built-in delays respect Wikipedia servers
- **Data persistence:** Each run creates new timestamped files

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "node is not recognized" | Install Node.js from nodejs.org |
| "Cannot find module" | Run `npm install` |
| "No data found" | Check internet connection and Wikipedia URL |
| CSV won't open | Try Excel, Google Sheets, or text editor |

## 📖 Documentation

- **SETUP_GUIDE.txt** - Detailed technical setup
- **USER_GUIDE.txt** - How to access and use data  
- **EXECUTIVE_SUMMARY.txt** - Project overview (generated)

## 🏃‍♂️ Ready to Start?

1. **Install Node.js** (if not already installed)
2. **Run `npm install`** in project folder
3. **Choose your category** from above
4. **Edit URL** in `wikiScraper1.js` (if using Category 1)
5. **Run the appropriate command**

**Questions?** Check SETUP_GUIDE.txt for detailed instructions.
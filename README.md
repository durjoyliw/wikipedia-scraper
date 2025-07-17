# 🌍 Wikipedia Disaster Data Scraper

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Stars](https://img.shields.io/github/stars/durjoyliw/wikipedia-scraper?style=social)](https://github.com/durjoyliw/wikipedia-scraper/stargazers)

> A comprehensive toolkit for collecting, analyzing, and packaging disaster data from Wikipedia with professional reporting capabilities.

## 📊 Project Results

🎯 **Successfully Collected:**
- **200+** disaster events documented
- **25,217** external sources gathered
- **768 years** of historical data (1256-2024)
- **100%** successful extraction rate

## 🚀 Features

### 🔧 **Four Powerful Tools**
- **📄 Single Page Scraper** - Extract structured data from any Wikipedia list page
- **🕷️ Mass Crawler** - Automatically crawl hundreds of linked pages for detailed information
- **📈 Analysis Engine** - Generate comprehensive statistical reports and insights
- **📦 Professional Packager** - Create client-ready deliverables with executive summaries

### ⚡ **Key Capabilities**
- ✅ **Smart Reference Resolution** - Extracts external sources and citations
- ✅ **Respectful Crawling** - Built-in delays to respect Wikipedia's servers
- ✅ **Professional Documentation** - Auto-generates executive summaries and user guides
- ✅ **Multiple Export Formats** - JSON, CSV, and formatted reports
- ✅ **Error Recovery** - Robust error handling prevents data loss
- ✅ **Scalable Architecture** - Handle 1000+ pages with current framework

## 🛠️ Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm (comes with Node.js)

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/durjoyliw/wikipedia-scraper.git

# Navigate to project directory
cd wikipedia-scraper

# Install dependencies
npm install
```

## 📖 Usage

### Category-Based Workflow

#### 1️⃣ **Single Page Scraping**
Perfect for targeted data collection from one Wikipedia page.

```bash
# Edit the URL in wikiScraper1.js, then run:
node wikiScraper1.js
```

**Use Cases:**
- Extract data from specific disaster lists
- Test scraper on new page types
- Quick data collection for small projects

#### 2️⃣ **Mass Crawling**
Collect detailed information from hundreds of individual pages.

```bash
# Must run step 1 first, then:
node auto_crawler.js
```

**Use Cases:**
- Comprehensive research datasets
- Building large-scale databases
- Academic research projects

#### 3️⃣ **Analysis & Reporting**
Generate professional reports and client packages.

```bash
# Generate statistical analysis
node generate_reports.js

# Create professional delivery package
node create_client_package.js
```

**Use Cases:**
- Client deliverables
- Stakeholder presentations
- Research publication packages

### Configuration

**To change target Wikipedia page:**
```javascript
// In wikiScraper1.js, modify:
const testUrl = "https://en.wikipedia.org/wiki/Your_Target_Page";
```

**To adjust crawling parameters:**
```javascript
// In auto_crawler.js, modify:
crawler.maxPages = 50;    // Number of pages to crawl
crawler.delay = 3000;     // Delay between requests (ms)
```

## 📁 Output Structure

### Single Page Scraping
```
📄 PageName_2025-07-16.json      # Complete structured data
📊 PageName_2025-07-16.csv       # Excel-ready tables
📋 PageName_2025-07-16_report.txt # Summary report
```

### Mass Crawling
```
📁 crawled_pages/
  ├── 📄 Black_Death.json           # Individual event files
  ├── 📄 Great_Famine_Ireland.json  # (200+ detailed files)
  ├── 📊 MASTER_INDEX.csv           # Complete catalog
  └── 📋 MASTER_INDEX.json          # Technical format
```

### Analysis & Reports
```
📁 ANALYSIS_REPORTS/
  ├── 📋 ANALYSIS_REPORT.txt        # Comprehensive insights
  ├── 📊 DISASTER_TYPES.csv         # Category breakdown
  ├── 📈 TIMELINE_DATA.csv          # Historical timeline
  └── 🌍 LOCATION_ANALYSIS.csv      # Geographic distribution

📁 CLIENT_DELIVERY_PACKAGE/
  ├── 📋 EXECUTIVE_SUMMARY.txt      # Professional overview
  ├── 📖 USER_GUIDE.txt             # Data access guide
  ├── 📊 SAMPLE_EVENTS.csv          # Quick preview
  └── 📈 MASTER_INDEX.csv           # Complete catalog
```

## 📈 Example Results

### Data Quality Metrics
- **Average Sources per Event:** 126 verified references
- **Geographic Coverage:** 15+ countries and regions
- **Temporal Span:** Medieval period to present day
- **Source Types:** Academic, governmental, news, and archival

### Disaster Categories Analyzed
- 🦠 Pandemics & Disease Outbreaks
- 🌊 Natural Disasters
- 🥀 Famines & Food Crises
- 💥 Industrial & Transport Accidents
- ⚔️ Terrorist Incidents & Violence

## 🔍 Use Cases

### 📚 **Academic Research**
- Historical disaster pattern analysis
- Comparative impact studies
- Source verification for publications
- Temporal trend analysis

### 🏢 **Business Intelligence**
- Risk assessment and planning
- Historical precedent research
- Content creation with verified facts
- Market analysis for insurance/planning sectors

### 🏛️ **Government & NGOs**
- Disaster preparedness planning
- Historical context for policy making
- Public education material development
- Emergency response benchmarking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR-USERNAME/wikipedia-scraper.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m 'Add some amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Wikipedia** for providing comprehensive, well-structured disaster information
- **Node.js Community** for excellent libraries (axios, cheerio)
- **Open Source Contributors** who make projects like this possible

## 📞 Contact

**Durjoy Liw** - [GitHub](https://github.com/durjoyliw)

Project Link: [https://github.com/durjoyliw/wikipedia-scraper](https://github.com/durjoyliw/wikipedia-scraper)

---

⭐ **Star this repository if you found it helpful!** ⭐

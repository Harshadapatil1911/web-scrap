const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');

const url = 'https://www.naukri.com/it-jobs?src=gnbjobs_homepage_srch';

const fetchJobData = async (url, retries = 3) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Uncomment the proxy section if you have a proxy server
      /*
      proxy: {
        host: 'proxy_host',
        port: 'proxy_port',
        auth: {
          username: 'proxy_username',
          password: 'proxy_password'
        }
      }
      */
    });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${3 - retries + 1})`);
      await new Promise(res => setTimeout(res, 2000)); // Wait for 2 seconds before retrying
      return fetchJobData(url, retries - 1);
    } else {
      throw error;
    }
  }
};

const scrapeJobs = async () => {
  try {
    const html = await fetchJobData(url);
    const $ = cheerio.load(html);
    const jobs = [];

    $('.jobTuple').each((index, element) => {
      const jobTitle = $(element).find('.title').text().trim();
      const companyName = $(element).find('.companyInfo .subTitle').text().trim();
      const location = $(element).find('.location .subTitle').text().trim();
      const jobType = $(element).find('.jobType').text().trim(); // This may need adjustment based on the actual HTML structure
      const postedDate = $(element).find('.jobTupleFooter .postedDate').text().trim();
      const jobDescription = $(element).find('.job-description').text().trim(); // This may need adjustment based on the actual HTML structure

      jobs.push({
        jobTitle,
        companyName,
        location,
        jobType,
        postedDate,
        jobDescription
      });
    });

    // Convert to Excel
    const worksheet = xlsx.utils.json_to_sheet(jobs);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Jobs');

    // Save to file
    xlsx.writeFile(workbook, 'tech_jobs.xlsx');
    console.log('Scraping and Excel generation completed successfully.');
  } catch (error) {
    console.error('Error fetching the webpage:', error);
  }
};

scrapeJobs();


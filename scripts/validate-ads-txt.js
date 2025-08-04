#!/usr/bin/env node

/**
 * AdSense ads.txt Validation Script
 * Helps validate and troubleshoot ads.txt configuration
 */

import https from 'https';
import http from 'http';

const DOMAIN = 'notecounter.shop';
const EXPECTED_PUBLISHER_ID = 'pub-1486700320478884'; // Update this with your actual publisher ID

function fetchAdsText(domain) {
  return new Promise((resolve, reject) => {
    const url = `https://${domain}/ads.txt`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to: ${res.headers.location}`);
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `https://${domain}${res.headers.location}`;
        
        https.get(redirectUrl, (redirectRes) => {
          let data = '';
          redirectRes.on('data', (chunk) => {
            data += chunk;
          });
          redirectRes.on('end', () => {
            resolve({
              statusCode: redirectRes.statusCode,
              content: data,
              headers: redirectRes.headers,
              redirected: true,
              finalUrl: redirectUrl
            });
          });
        }).on('error', reject);
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          content: data,
          headers: res.headers
        });
      });
    }).on('error', (err) => {
      // Try HTTP if HTTPS fails
      const httpUrl = `http://${domain}/ads.txt`;
      http.get(httpUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            content: data,
            headers: res.headers,
            protocol: 'HTTP'
          });
        });
      }).on('error', (httpErr) => {
        reject(httpErr);
      });
    });
  });
}

function validateAdsText(content, publisherId) {
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const googleEntries = lines.filter(line => 
    line.includes('google.com') && line.includes(publisherId)
  );
  
  return {
    hasGoogleEntry: googleEntries.length > 0,
    hasCorrectPublisherId: googleEntries.some(line => line.includes(publisherId)),
    googleEntries,
    allLines: lines
  };
}

async function main() {
  console.log(`🔍 Validating ads.txt for ${DOMAIN}...`);
  console.log(`📋 Expected Publisher ID: ${EXPECTED_PUBLISHER_ID}`);
  console.log('');
  
  try {
    const result = await fetchAdsText(DOMAIN);
    
    console.log(`✅ Status Code: ${result.statusCode}`);
    console.log(`🌐 Protocol: ${result.protocol || 'HTTPS'}`);
    console.log(`📄 Content-Type: ${result.headers['content-type'] || 'Not specified'}`);
    
    if (result.redirected) {
      console.log(`🔄 Redirected to: ${result.finalUrl}`);
    }
    
    console.log('');
    
    if (result.statusCode === 200) {
      console.log('📝 Content:');
      console.log('─'.repeat(50));
      console.log(result.content);
      console.log('─'.repeat(50));
      console.log('');
      
      const validation = validateAdsText(result.content, EXPECTED_PUBLISHER_ID);
      
      console.log('🔍 Validation Results:');
      console.log(`   Google entry found: ${validation.hasGoogleEntry ? '✅' : '❌'}`);
      console.log(`   Correct Publisher ID: ${validation.hasCorrectPublisherId ? '✅' : '❌'}`);
      
      if (validation.googleEntries.length > 0) {
        console.log('\n📋 Google AdSense entries found:');
        validation.googleEntries.forEach((entry, index) => {
          console.log(`   ${index + 1}. ${entry}`);
        });
      }
      
      if (validation.hasGoogleEntry && validation.hasCorrectPublisherId) {
        console.log('\n🎉 ads.txt looks good! Your AdSense should be authorized.');
        console.log('\n💡 Note: It may take 24-48 hours for AdSense to recognize changes.');
      } else {
        console.log('\n⚠️  Issues found:');
        if (!validation.hasGoogleEntry) {
          console.log('   - No Google AdSense entry found');
        }
        if (!validation.hasCorrectPublisherId) {
          console.log(`   - Publisher ID ${EXPECTED_PUBLISHER_ID} not found`);
          console.log('   - Make sure this matches your AdSense account');
        }
      }
    } else {
      console.log(`❌ Failed to fetch ads.txt (Status: ${result.statusCode})`);
    }
    
  } catch (error) {
    console.log(`❌ Error fetching ads.txt: ${error.message}`);
    console.log('\n💡 Possible issues:');
    console.log('   - Domain not accessible');
    console.log('   - ads.txt not deployed');
    console.log('   - Network connectivity issues');
  }
  
  console.log('\n📚 AdSense ads.txt Requirements:');
  console.log('   1. File must be accessible at: https://yourdomain.com/ads.txt');
  console.log('   2. Content-Type should be text/plain');
  console.log('   3. Must contain: google.com, pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0');
  console.log('   4. Publisher ID must match your AdSense account');
  console.log('   5. Changes can take 24-48 hours to take effect');
}

main();

export { fetchAdsText, validateAdsText };

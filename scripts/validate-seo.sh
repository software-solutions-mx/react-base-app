#!/bin/bash

SITE_URL="${1:-https://softwaresolutions.com.mx}"

echo "SEO validation for ${SITE_URL}"
echo ""

echo "1) robots.txt"
curl -s "${SITE_URL}/robots.txt" | head -n 10
echo ""

echo "2) sitemap.xml url count"
curl -s "${SITE_URL}/sitemap.xml" | grep -c "<url>"
echo ""

echo "3) homepage title"
curl -s "${SITE_URL}/" | grep -o "<title>.*</title>" | head -n 1
echo ""

echo "4) homepage canonical"
curl -s "${SITE_URL}/" | grep -o 'rel="canonical" href="[^"]*"' | head -n 1
echo ""

echo "5) homepage h1"
curl -s "${SITE_URL}/" | grep -o '<h1[^>]*>.*</h1>' | head -n 1
echo ""

echo "6) homepage og:title"
curl -s "${SITE_URL}/" | grep -o 'property="og:title" content="[^"]*"' | head -n 1
echo ""

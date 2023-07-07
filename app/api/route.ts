import { NextResponse } from 'next/server'
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface SelectorObject {
  [key: string]: string;
}
async function scrapePage(html: string, selectors: SelectorObject[]) {
  const $ = cheerio.load(html);
  const result: SelectorObject[] = [];

  let longestArrayLength = 0;
  const scrapedData: { [key: string]: string[] } = {};

  for (const selectorObj of selectors) {
    for (const key in selectorObj) {
      if (typeof selectorObj[key] === 'string') {
        const selector: string = selectorObj[key];
        const elements = $(selector);

        const normalizedTextArray = elements.map((_, el) => {
          const rawText = $(el).text();
          return rawText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\n/g, '').trim();
        }).toArray();

        scrapedData[key] = normalizedTextArray;

        if (normalizedTextArray.length > longestArrayLength) {
          longestArrayLength = normalizedTextArray.length;
        }
      } else {
        console.log(`Invalid selector for key '${key}'`);
      }
    }
  }

  for (let i = 0; i < longestArrayLength; i++) {
    let item: SelectorObject = {};

    for (const selectorObj of selectors) {
      for (const key in selectorObj) {
        item[key] = scrapedData[key][i] || '';
      }
    }

    result.push(item);
  }

  return result;
}

export async function POST(request: Request) {

  const { url, elementsPattern } = await request.json()
  console.log({ url, elementsPattern })
  try {
    const fetchURL = await fetch(`https://${url}`)
    const html = await fetchURL.text()

    const result = await scrapePage(html, elementsPattern)

    console.log({ result })
    return NextResponse.json({ result })
  } catch (error) {
    console.log({ error })
    return NextResponse.json({ error })
  }
}
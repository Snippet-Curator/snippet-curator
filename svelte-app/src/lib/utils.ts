import { page } from '$app/state';

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function categorizeMediabyType(content: string) {
  const mediaMatch =
    /<media\s+src=["']?(?<src>[^"'\s>]+)["']?\s+type=["']?(?<type>[^"'\s>]+)["']?\s*>/g;

  const replaceMedia = (match: string, src: string, type: string) => {

    console.log(type)
    if (type.includes('image')) {
      return `<img style='max-width: 100%; height: auto' src=${src}>`;
    }

    if (type == 'video/mp4') {
      return `<video style='width:100%' controls class="w-full mx-auto rounded-md shadow-md"><source src=${src} type=${type} />Your browser does not support the video tag.</video>`
    }
  };

  return content.replace(mediaMatch, replaceMedia);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export async function getCorrectPage() {
  if (!page.state.previousHistoryPage) return 1

  if (page.state) {
    const { pageType, previousHistoryPage } = page.state;

    console.log(page.state, pageType);

    if (pageType == 'notes') {
      return previousHistoryPage;
    } else if (pageType == 'tags') {
      return previousHistoryPage;
    } else if (pageType == 'notebooks') {
      return previousHistoryPage
    }
  }
}
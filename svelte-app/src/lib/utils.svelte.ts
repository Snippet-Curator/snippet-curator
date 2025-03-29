import { page } from '$app/state';

export function categorizeMediabyType(content: string) {
  const mediaMatch =
    /<media\s+src=["']?(?<src>[^"'\s>]+)["']?\s+type=["']?(?<type>[^"'\s>]+)["']?\s*>/g;

  const replaceMedia = (match: string, src: string, type: string) => {

    if (type.includes('image')) {
      return `<img style='max-width: 100%; height: auto' src=${src}>`;
    }

    if (type == 'video/mp4') {
      return `<video style='width:100%' controls class="w-full mx-auto rounded-md shadow-md"><source src=${src} type=${type} />Your browser does not support the video tag.</video>`
    }
  };

  return content.replace(mediaMatch, replaceMedia);
}

export function getCorrectPage() {
  if (!page.state.previousHistoryPage) return 1
  return page.state.previousHistoryPage
}

function changeSearchTerm() {
  let searchTerm = $state('');
  return {
    get searchTerm() { return searchTerm },
    set searchTerm(value) { searchTerm = value },
  }
}

function signalSavePage() {
  let savedPages = $state(new Map())
  return {
    get savedPages() { return savedPages },
    set savedPages(value) { savedPages = value },
    updatePageData(url: string, currentPage: number) {
      savedPages.set(url, currentPage)
    }
  }
}

// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}



export const searchState = changeSearchTerm()
export const signalPageState = signalSavePage()

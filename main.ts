const firstStep = 'interviewPages/Startpage.html';

window.addEventListener('load', function() {
  getNextPage(firstStep);
});

/**
 * Fetch an interview page and insert it into the page
 * @param {string} pageUrl the URL of the page to fetch
 */
function getNextPage(pageUrl:string) {
  const NextPageReq = new XMLHttpRequest();
  NextPageReq.open('GET', pageUrl, true);
  NextPageReq.send();
  NextPageReq.onreadystatechange = function() {
    if (NextPageReq.readyState === 4 && NextPageReq.status === 200) {
      document.querySelector('.mainbox').innerHTML = NextPageReq.responseText;
    }
  }
}

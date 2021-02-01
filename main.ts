const firstStep = 'interviewPages/Startpage.html';
let stepsLoaded = 0;

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
      let translateY = '-50%';
      if(window.innerHeight > window.innerWidth){
        translateY = '0%';
      }
      let newStep = document.createElement('div');
      newStep.classList.add('mainbox');
      newStep.id = 'step-' + stepsLoaded;
      moveLastStep(stepsLoaded);
      stepsLoaded += 1;
      newStep.innerHTML = NextPageReq.responseText;
      document.body.appendChild(newStep);
      setTimeout(function() {
        console.log('translate(-50%, ' + translateY + ')')
        newStep.style.transform = 'translate(-50%, ' + translateY + ')';
      }, 50);
    }
  }
}

function moveLastStep(step:number) {
  if (step > 0) {
    step -= 1;
    let translateY = '-50%';
    if(window.innerHeight > window.innerWidth){
      translateY = '0%';
    }
    let element = document.querySelector<HTMLElement>('#step-' + step);
    let leftMove = parseInt(element.style.transform.split('-')[1].split('%')[0], 10);
    leftMove += 120;
    element.style.transform = 'translate(-' + leftMove + '%, ' + translateY + ')';
    element.style.opacity = '0.3';
    element.style.pointerEvents = 'none';
    moveLastStep(step);
  }
}

function backOneStep() {
  let translateY = '-50%';
  if(window.innerHeight > window.innerWidth){
    translateY = '0%';
  }
  const steps:NodeListOf<HTMLElement> = document.querySelectorAll('.mainbox');
  let newestStep = steps[steps.length-1];
  let lastStep = steps[steps.length-2];
  newestStep.style.transform = 'translate(100vw, ' + translateY + ')';
  lastStep.style.opacity = '1';
  lastStep.style.pointerEvents = 'auto';
  for (let i = 0; i < steps.length-1; i++) {
    let leftMove = parseInt(steps[i].style.transform.split('-')[1].split('%')[0], 10);
    leftMove -= 120;
    steps[i].style.transform = 'translate(-' + leftMove + '%, ' + translateY + ')';
  }
  setTimeout(function() {
    newestStep.remove()
  }, 250)
  stepsLoaded -= 1;
}

function addQuality() {
  let currentQualities = document.querySelectorAll('.quality');
  let lastQuality = currentQualities[currentQualities.length-1];
  let newQuality = document.createElement('input');
  newQuality.type = 'text';
  newQuality.placeholder = 'Example quality';
  newQuality.classList.add('quality');
  lastQuality.parentNode.insertBefore(newQuality, lastQuality.nextSibling);
}
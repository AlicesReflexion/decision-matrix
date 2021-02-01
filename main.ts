const firstStep = 'interviewPages/Startpage.html';
let stepsLoaded = 0;
let priority = {
  program: {},
  priorities: {},
};
let questionArray = [];

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
  NextPageReq.onreadystatechange = () => {
    if (NextPageReq.readyState === 4 && NextPageReq.status === 200) {
      let translateY = '-50%';
      if (window.innerHeight > window.innerWidth) {
        translateY = '0%';
      }
      const newStep = document.createElement('div');
      newStep.classList.add('mainbox');
      newStep.id = 'step-' + stepsLoaded;
      moveLastStep(stepsLoaded);
      stepsLoaded += 1;
      newStep.innerHTML = NextPageReq.responseText;
      document.body.appendChild(newStep);
      setTimeout(() => {
        newStep.style.transform = 'translate(-50%, ' + translateY + ')';
      }, 50);
    }
  };
}

/**
 * Move element to the left to accompany new step
 * @param {number} step Numbered instance of the element we're moving
 */
function moveLastStep(step:number) {
  if (step > 0) {
    step -= 1;
    let translateY = '-50%';
    if (window.innerHeight > window.innerWidth) {
      translateY = '0%';
    }
    const element = document.querySelector<HTMLElement>('#step-' + step);
    let leftMove = parseInt(element.style.transform.split('-')[1].split('%')[0], 10);
    leftMove += 120;
    element.style.transform = 'translate(-' + leftMove + '%, ' + translateY + ')';
    element.style.opacity = '0.3';
    element.style.pointerEvents = 'none';
    moveLastStep(step);
  }
}

/**
 * Remove the current element and go back to the last interview page.
 */
function backOneStep() {
  let translateY = '-50%';
  if (window.innerHeight > window.innerWidth) {
    translateY = '0%';
  }
  const steps:NodeListOf<HTMLElement> = document.querySelectorAll('.mainbox');
  const newestStep = steps[steps.length-1];
  const lastStep = steps[steps.length-2];
  newestStep.style.transform = 'translate(100vw, ' + translateY + ')';
  lastStep.style.opacity = '1';
  lastStep.style.pointerEvents = 'auto';
  for (let i = 0; i < steps.length-1; i++) {
    let leftMove = parseInt(steps[i].style.transform.split('-')[1].split('%')[0], 10);
    leftMove -= 120;
    steps[i].style.transform = 'translate(-' + leftMove + '%, ' + translateY + ')';
  }
  setTimeout(function() {
    newestStep.remove();
  }, 250);
  stepsLoaded -= 1;
}

/**
 * create a new input field for qualities the user cares about
 */
function addQuality() {
  const currentQualities = document.querySelectorAll('.quality');
  const lastQuality = currentQualities[currentQualities.length-1];
  const newQuality = document.createElement('input');
  newQuality.type = 'text';
  newQuality.placeholder = 'Example quality';
  newQuality.classList.add('quality');
  lastQuality.parentNode.insertBefore(newQuality, lastQuality.nextSibling);
}

/**
 * Populate the 'priority' object with the name of the programs and qualities the user is interested in.
 * This is only used for the 'simple' interview.
 */
function createSimplePriorityObject() {
  const nameElements:NodeListOf<HTMLInputElement> = document.querySelectorAll('.programName');
  const qualityElements:NodeListOf<HTMLInputElement> = document.querySelectorAll('.quality');
  qualityElements.forEach((element) => {
    priority.priorities[element.value] = 0;
  });
  nameElements.forEach((element) => {
    priority.program[element.value] = {};
    qualityElements.forEach((el2) => {
      priority.program[element.value][el2.value] = 0;
    });
  });
  createRankingPage();
}

/**
 * Create the ranking page, and set it as the next page in the interview.
 */
function createRankingPage() {
  const NextPageReq = new XMLHttpRequest();
  NextPageReq.open('GET', 'interviewPages/SimpleInterview/rankPriorities.html', true);
  NextPageReq.send();
  NextPageReq.onreadystatechange = () => {
    if (NextPageReq.readyState === 4 && NextPageReq.status === 200) {
      let translateY = '-50%';
      if (window.innerHeight > window.innerWidth) {
        translateY = '0%';
      }
      const newStep = document.createElement('div');
      newStep.classList.add('mainbox');
      newStep.id = 'step-' + stepsLoaded;
      newStep.innerHTML = NextPageReq.responseText;
      document.body.appendChild(newStep);
      const toClone = newStep.children[1].children[0].children[1];
      const numClones = Object.keys(priority.priorities).length-1;
      for (let i = 0; i < numClones; i++) {
        const clone = toClone.cloneNode(true);
        toClone.parentNode.insertBefore(clone, toClone.nextSibling);
      }
      for (let i = 1; i < toClone.parentNode.children.length; i++) {
        const oldHTML = toClone.parentNode.children[i].innerHTML;
        const properName = Object.keys(priority.priorities)[i-1];
        let smallName = properName.toLowerCase();
        smallName = smallName.split(' ').join('');
        let newHTML = oldHTML.split('%Quality name%').join(properName);
        newHTML = newHTML.split('%qualityname%').join(smallName);
        toClone.parentNode.children[i].innerHTML = newHTML;
      }
      moveLastStep(stepsLoaded);
      stepsLoaded += 1;
      setTimeout(() => {
        newStep.style.transform = 'translate(-50%, ' + translateY + ')';
      }, 50);
    }
  };
}

/**
 * Update the priority object according to what the user answers in the RankPriorities page
 * This is only used in the 'simple' interview.
 */
function populatePriorityValues() {
  const selectedValues = document.querySelector('#step-3').children[1].children[0].children;
  for (let i = 1; i < selectedValues.length; i++) {
    const property = <HTMLInputElement>selectedValues[i].children[1].children[0];
    const propertyName = property.name;
    const query = 'input[name="' + propertyName + '"]:checked';
    const selectedButton = <HTMLInputElement>document.querySelector(query);
    const quality = selectedButton.parentElement.parentElement.children[0].innerHTML;
    priority.priorities[quality] = selectedButton.value;
  }
  createQuestionPages();
}

/**
 * Create the array of question pages for every quality.
 */
function createQuestionPages() {
  let idIncrementer = 0;
  const NextPageReq = new XMLHttpRequest();
  NextPageReq.open('GET', 'interviewPages/SimpleInterview/whichIsBetter.html', true);
  NextPageReq.send();
  NextPageReq.onreadystatechange = () => {
    if (NextPageReq.readyState === 4 && NextPageReq.status === 200) {
      const responseText = NextPageReq.responseText;
      Object.keys(priority.priorities).forEach((element) => {
        const currentQ = document.createElement('div');
        currentQ.classList.add('mainbox');
        let innerHTML = responseText.split('%Quality Name%').join(element);
        innerHTML = innerHTML.split('%progA%').join(Object.keys(priority.program)[0]);
        innerHTML = innerHTML.split('%progB%').join(Object.keys(priority.program)[1]);
        currentQ.innerHTML = innerHTML;
        questionArray.push(currentQ);
      });
      questionArray.forEach((element) => {
        element.id = 'step-' + (stepsLoaded + idIncrementer);
        idIncrementer += 1;
      });
      loadNextQuestion('', '');
    }
  };
}

/**
 * Load the next page in the stack of questions.
 * @param {string} question The name of the quality chosen.
 * @param {string} answer The chosen answer.
 */
function loadNextQuestion(question:string, answer:string) {
  if (question !== '' && answer !== '') {
    priority.program[answer][question] = 1;
  }
  if (typeof(questionArray[0]) !== 'undefined') {
    let translateY = '-50%';
    if (window.innerHeight > window.innerWidth) {
      translateY = '0%';
    }
    const toLoad = questionArray[0];
    document.body.appendChild(toLoad);
    moveLastStep(stepsLoaded);
    stepsLoaded += 1;
    setTimeout(() => {
      toLoad.style.transform = 'translate(-50%, ' + translateY + ')';
    }, 50);
    questionArray.shift();
  } else {
    displayFinalResults();
  }
}

/**
 * calculate and display final results
 */
function displayFinalResults() {
  let compareArray = [];
  Object.keys(priority.program).forEach((element) => {
    Object.keys(priority.program[element]).forEach((subval) => {
      priority.program[element][subval] = priority.program[element][subval] * priority.priorities[subval];
    });
  });
  Object.keys(priority.program).forEach((element) => {
    Object.values(priority.program[element]).reduce((a:number, b:number) => a+b, 0);
    compareArray[element] = Object.values(priority.program[element]).reduce((a:number, b:number) => a+b, 0);
  });
  let largest = Object.keys(compareArray).reduce((a, b) => compareArray[a] > compareArray[b] ? a : b);
  const NextPageReq = new XMLHttpRequest();
  NextPageReq.open('GET', 'interviewPages/SimpleInterview/yourChoiceIs.html', true);
  NextPageReq.send();
  NextPageReq.onreadystatechange = () => {
    if (NextPageReq.readyState === 4 && NextPageReq.status === 200) {
      let innerHTML = NextPageReq.responseText.split('%Best Choice%').join(largest);
      let translateY = '-50%';
      if (window.innerHeight > window.innerWidth) {
        translateY = '0%';
      }
      const newStep = document.createElement('div');
      newStep.classList.add('mainbox');
      newStep.id = 'step-' + stepsLoaded;
      newStep.innerHTML = innerHTML;
      document.body.appendChild(newStep);
      moveLastStep(stepsLoaded);
      stepsLoaded += 1;
      setTimeout(() => {
        newStep.style.transform = 'translate(-50%, ' + translateY + ')';
      }, 50);
    }
  };
}

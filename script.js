'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementsDate = function (date, locale) {
  //function calcDaysPassed qui va permettre de savoir cb de jour il y a entre les 2 dates
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//changer le € deja defini en signe du pays fait par une fonction
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html); // je crois c pr dire lordre des affichage des mouv
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call , print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 sec stop timer and logout
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  //Set time to 5 minutes
  let time = 300;
  //Call the time every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // create current date and time
    const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //si on met long ca met le mois plutot que le chiffre
      year: 'numeric', // si on met 2-digit ca donnera que 2 chiffres 2023->23
    };
    // et du coup on ajouter apres le code fr-FR le options
    const locale = currentAccount.locale; //sert a prendre le language du currentAccount
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //Timer:
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfert date
    currentAccount.movementsDates.push(new Date().toISOString()); //format date du tableau
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Reset the timer after the transfer car c est une activite donc l useur pas inactif
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //Reset the timer after the loan car c est une activite donc l useur pas inactif
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//Number.isFinite(avec la valeur ou le string) dira si c est un num ou pas !
// parseInt et parseFloat permet de lire le numero d un string par exemple de css 1px => 1

/*on connait trunc pour enlever la partie decimale mais il existe encore mieux
la methode round arrondie au plus proche le chiffre : ex: Math.round(23.3) => 23
tandis que Math.round(23.9) => 24
il existe aussi la methode ceil pour arrondir au superieur Math.ceil(23.3) => 24
et Math.ceil(23.9) => 24 et egalement a l inferieur avec floor Math.floor(23.3) => 23
et Math.floor(23.9) => 23
On pourrai se dire que trunc et floor sont les memes ! c est le cas pour les chiffres positif
mais pour les chiffres negatif c est different si on fait Math.truc(-23.3) => -23
tandis que Math.floor(-23.3) => -24 car c est l inverse pour negatif on arrondi a l inverse
*/

// arrondir des decimal :
// console.log((2.7).toFixed(0)); // donnera 3 en string
// console.log((2.7).toFixed(3)); // donnera 2.700 en string
// console.log((2.345).toFixed(2)); // donnera 2.35 en string
// console.log(+(2.345).toFixed(0)); // donnera 2.35 mais en chiffre

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orangered';
    } else {
      row.style.backgroundColor = 'skyblue';
    }
  });
});

//Les dates :
//const now = new Date();
//console.log(now);//date du jour
// const future = new Date(2037, 10, 19, 15, 23); //19/11/2037 a 15:23->11 les mois comnce a 0
// console.log(future.getFullYear()); // donne l annee 2037 en type number
// console.log(future.getMonth()); // donne le mois en type number 10
// console.log(future.getDate()); // donne le numero du jour en type number 19
// console.log(future.getDay()); // donne le jour de la semaine jeudi en type number 4
// console.log(future.toISOString()) // transforme le future en une chaine utile 2037-11-19T15:23:00:000Z
// pour changer le jour date annee ou autres du future on fait setFullYear ou setMonth etc

//MODIFIER LA DATE A JOUR DE L APPLICATION BANKIST on va la mettre la ou il se co :
// const now = new Date();
// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hour = now.getHours();
// const min = now.getMinutes();
// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

//changer la date suivant le pays grace a l experimentation de l api suivant le code fr-FR
//ou autre trouver sur le site http://www.lingoes.net/en/translator/langcode.htm
// containerApp.style.opacity = 100;
// const now = new Date();
/* pour ajouter l heure etc en plus de la date  dans le label on creer un objet :
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric', //si on met long ca met le mois plutot que le chiffre
  year: 'numeric', // si on met 2-digit ca donnera que 2 chiffres 2023->23
  weekday: 'long',
};
const locale = navigator.language; // sert a savoir dans quel langue est votre naviguateru
// et du coup on ajouter apres le code fr-FR le options
labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
*/

/*pour transformer le chiffre en format du pays on fait:
const num=394394394.21;
console.log('US: ' , new Intl.NumberFormat('en-US').format(num)); ca mettre num en format us
ou console.log('US: ' , new Intl.NumberFormat('de-DE').format(num));num en format allemand...

si a cela on veut ajouter une mesure on fait comme ca :
const options={
  style:'unit', // pour le % on met percent au lieu de unit
  unit:'mile-per-hour,
}; et dans le intl.numberformat on ajoute options console.log('US: ' , new Intl.NumberFormat('de-DE',options).format(num));
*/

/*LES MINUTEURS LES TIMOUTS:ici on veut afficher apres 3 secondes voila la pizza avec les 
ingredients mais on va ajouter un if qui dit si ca contient l ingredient x alors stop time

const ingredients =['olives','spinach'];
const pizzaTimer = setTimeout((ing1,ing2)=>console.log(`Here is your pizza with ${ing1} and
${ing2}`),3000,...ingredients); 
console.log('Waitin...);
if(ingredients.includes('spinach')) clearTimeout(pizzaTimer); // donc on annule le chrono
*/

//setInterval function :
setInterval(function () {
  const now2 = new Date();
  console.log(now2);
}, 10000);

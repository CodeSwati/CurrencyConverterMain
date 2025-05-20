const amount = document.getElementById('amount');
const conversionFrom = document.getElementById('conversionFrom');
const conversionTo = document.getElementById('conversionTo');
const currencyFull = document.getElementById('currencyFull');
const from_currency_name = document.getElementById('from-currency-name');
const to_currency_name = document.getElementById('to-currency-name');
const currencyToFull = document.getElementById('currencyToFull');
const from_currency_code = document.getElementById('from-currency-code');
const to_currency_code = document.getElementById('to-currency-code');
const curruncy_symbol = document.getElementById('curruncy_symbol');
const base_curr_from_code =document.getElementById('base-curr-from-code');
const base_curr_to_code =document.getElementById('base-curr-to-code');
const base_curr_value = document.getElementById('base-curr-value');

amount.addEventListener('click', () => {
  const amountValue = parseFloat(amount.value);
  if (!isNaN(amountValue)) {
    amount.value = amountValue.toFixed();
  }
});

amount.addEventListener('input', () => {
  const amountValue = parseFloat(amount.value);
  if (!isNaN(amountValue)) {
    convertCurrency(); 
  }
});
amount.addEventListener('blur', () => {
  const amountValue = parseFloat(amount.value);
  if (!isNaN(amountValue)) {
    amount.value = amountValue.toFixed(2);
  }
  convertCurrency();
});

$(document).on('click', '.FromCurrList li, .toCurrList li', async function () {
  const selectedCurrency = $(this).find('.currency-name').text().trim();
  const flagSrc = $(this).find('.cntry-flag img').attr('src');
  const currencyCode = selectedCurrency.split(' ')[0];
  const currencyName = selectedCurrency.slice(currencyCode.length).trim();
  let curruncy_symbol  =$(this).data('symbol');
 
  $(".listmain li").show();
  if ($(this).closest('.FromCurrList').length) {
    $('#from-flag').attr('src', flagSrc);
    $('#from-currency-code').text(currencyCode);
    $('#from-currency-name').text(' - ' + currencyName);
    $('#curruncy_symbol').text(curruncy_symbol);
    $('#input-box2').hide();
    $('#input-box2 input').val('');
  } else {
    $('#to-flag').attr('src', flagSrc);
    $('#to-currency-code').text(currencyCode);
    $('#to-currency-name').text(' - ' + currencyName);
    $('#input-box3').hide();
    $('#input-box3 input').val('');
  }

  if ($('#button-Coversion').is(':hidden')) {
    convertCurrency();
  }
  convertCurrency();
});


amount.addEventListener('input', function () {
  if ($('#button-Coversion').is(':hidden')) {
    convertCurrency();
  }
});

let filteredCountries = [];
let currencySymbol;

async function getCountryAll(data) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/all`);
    if (!response.ok) {
      throw new Error('Country data fetch failed');
    }
    const countryData = await response.json();
    console.log(countryData);
    // console.log(JSON.stringify(countryData[0]));
    filteredCountries = countryData.map(country => {
      const name = country.name?.common || "N/A";
      const flag = country.flags?.png || "No flag";

      let currencyCode = "N/A";
      let currencyName = "N/A";
       currencySymbol = "N/A";

      if (country.currencies) {
        const codes = Object.keys(country.currencies);
        
        currencyCode = codes[0];
        currencyName = country.currencies[currencyCode]?.name || "N/A";
        currencySymbol = country.currencies[currencyCode]?.symbol || "N/A";
      }

      return {
        name,
        flag,
        currencyCode,
        currencyName,
        currencySymbol
      };
    });

    // $("#curruncy_symbol").text(currencySymbol)
    
    const toCurrList = document.querySelector('.toCurrList');
    toCurrList.innerHTML = '';

    getListfromClass(toCurrList);
    
    const fromCurrList = document.querySelector('.FromCurrList');
    fromCurrList.innerHTML = '';
    getListfromClass(fromCurrList);

  }
  catch (error) {
    console.error('Error fetching country info:', error);
  }
}
getCountryAll();

const fromCurrencyInput = document.getElementById('from-currency-search');
const toCurrencyInput = document.getElementById('to-currency-search');

fromCurrencyInput.addEventListener('keyup', function () {
  getToggleDataOfList(this.value, 'FromCurrList')
});
toCurrencyInput.addEventListener('keyup', function () {
  getToggleDataOfList(this.value, 'toCurrList')
});

function getToggleDataOfList(data,list) {
  const query = data.trim().toLowerCase();

  $(`.${list} li`).each(function () {
    const country = $(this).data('country')?.toLowerCase() || '';
    const currency = $(this).data('currency')?.toLowerCase() || '';
    const label = $(this).find('.currency-name').text().toLowerCase();
   
    const matches =
      country.includes(query) ||
      currency.includes(query) ||
      label.includes(query);

    $(this).toggle(matches); // Show if matches, otherwise hide
  });
}
 
function getListfromClass(append){
  filteredCountries.forEach(country => {
    if (country.currencyCode !== "N/A" && country.currencyName !== "N/A") {
      const li = document.createElement('li');
      li.className = 'listitem align-items-center gap-2 px-3';
      li.setAttribute('data-country', country.name);
      li.setAttribute('data-currency', country.currencyCode);
      li.setAttribute('data-symbol', country.currencySymbol);

      li.innerHTML = `
         <span class="cntry-flag">
           <img alt="${country.currencyCode}" src="${country.flag}">
         </span>
         <span class="currency-name">
           ${country.currencyCode} ${country.currencyName}
         </span>
       `;

      append.appendChild(li);
    }
  });
}

async function convertCurrency() {
  const amountValue = parseFloat(amount.value);
  const fromCode = from_currency_code.innerHTML.trim();
  const toCode = to_currency_code.innerHTML.trim();

  if (!fromCode || !toCode || isNaN(amountValue)) {
    console.warn('Missing fromCode or toCode or invalid amount');
    conversionFrom.innerHTML = '';
    conversionTo.textContent = '';
    currencyToFull.textContent = '';
    return;
  }

  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCode}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('API data:', data);
    console.log('Looking for rate for:', toCode);

    const rate = data.rates[toCode];

    if (!rate) {
      console.warn(`Rate for ${toCode} not found in API response`);
      alert(`Exchange rate not available for ${toCode}`);
      return;
    }

    const convertedAmount = amountValue * rate;
    console.log(rate);
    
    conversionFrom.innerHTML = `${amountValue} ${from_currency_name.innerHTML.trim().slice(1)} =`;
    conversionTo.textContent = `${convertedAmount.toFixed(4)}`;
    currencyToFull.textContent = `${to_currency_name.innerHTML.trim().slice(1)}`;

    console.log(curruncy_symbol.textContent);
    
    $("#base-curr-from-code").text($("#from-currency-code").text())
    $("#base-curr-to-value").text($("#to-currency-code").text())
    $('#base-curr-value').text(rate)

    document.getElementById("displayConversion").style.visibility = "visible";
  

  } catch (error) {
    console.error('Conversion error:', error);
    alert('Failed to fetch exchange rate. Please try again later.');
  }
}

// swapping

let rotated = false;

document.querySelector('.toggle-btn').addEventListener('click', function () {
    rotated = !rotated;
  
    $(this).css({
      'transform': rotated ? 'rotate(180deg)' : 'rotate(0deg)',
      'transition': 'transform 0.2s ease-in-out'
    });

  const fromFlag = document.getElementById('from-flag');
  const toFlag = document.getElementById('to-flag');
  const tempFlagSrc = fromFlag.src;
  fromFlag.src = toFlag.src;
  toFlag.src = tempFlagSrc;

  const fromCode = document.getElementById('from-currency-code');
  const toCode = document.getElementById('to-currency-code');
  const tempCode = fromCode.textContent;
  fromCode.textContent = toCode.textContent;
  toCode.textContent = tempCode;


  const fromName = document.getElementById('from-currency-name');
  const toName = document.getElementById('to-currency-name');
  const tempName = fromName.textContent;
  fromName.textContent = toName.textContent;
  toName.textContent = tempName;


  convertCurrency(); 
});


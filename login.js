//----------- initial variable ---------------
const account = JSON.parse(localStorage.getItem('account'))
const form = document.querySelector('form')
let id = document.querySelector('#id')
let password = document.querySelector('#password')



//---------- event: login form submit -------------------
form.addEventListener('submit', function onFormClicked(event) {
  event.preventDefault()
  checkAccount(account)
})

//---------- function: check account in localStorage -----
function checkAccount(account) {
  if (account.some(item => item.id === id.value && item.password === password.value)) {
    return window.location.href = 'index.html'
  }
  return alert('帳號或密碼輸入錯誤')
}

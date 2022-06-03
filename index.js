//---------------- initial variable -----------------------
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/';
const FLAG_URL = 'https://countryflagsapi.com/png/';

const userPanel = document.querySelector('#user-panel');
const searchForm = document.querySelector('#search-form')
const input = document.querySelector('#input-text')
const paginator = document.querySelector('#paginator')
const layoutPanel = document.querySelector('#layout-panel')
const login = document.querySelector('#login')
const toolPanel = document.querySelector('#tools')

const account = JSON.parse(localStorage.getItem('account'))
const favoriteList = JSON.parse(localStorage.getItem("favoriteUsers")) || []

const users = [];
let filterUsers = []
const PER_PAGE_DATA = 12
let currentPage = 1


//---------------- request：get data ----------------------
axios
  .get(BASE_URL)
  .then(function getResponse(response) {
    "use strict";
    users.push(...response.data.results);
    renderUsers(getDataByPage(currentPage)); //only render first page
    renderPaginator(users.length)
  })
  .catch((error) => console.log(error));



//event 
//--------- event：user panel clicked -------------------
userPanel.addEventListener("click", function onUserPanelClicked(event) {
  "use strict";
  const target = event.target;
  const targetStyle = target.classList

  //show more user info
  if (target.matches("#btn-show-user")) {
    const userId = target.dataset.id;
    //invoke getShowUrl func to get more detail info
    getShowUrl(userId);

  } else if (target.matches(".btn-add-favorite")) {
    if (!account) {
      return alert('請先登入')
    }
    //change heart font awesome
    target.classList.toggle("fa-solid")
    const id = Number(target.dataset.id)
    //add to or remove from localStorage
    target.classList.contains('fa-solid') ? addToLocalStorage(id) : removeLocalStorage(id)
  }
});

//--------- event：form clicked --------------------------
searchForm.addEventListener("submit", function onFormClicked(event) {
  'use strict'
  event.preventDefault()
  const searchValue = input.value.trim().toLowerCase() //no space & be lower case

  if (!searchValue.length) return //input no value

  filterUsers = users.filter(user => ((user.name + user.surname).toLowerCase()).includes(searchValue)) //full name filter
  if (!filterUsers.length) {
    return alert('無相關姓名關鍵字志工')
  }

  renderUsers(getDataByPage(currentPage)) //only render first page
  renderPaginator(filterUsers.length)
})

//--------- event：paginator clicked ------------------
paginator.addEventListener('click', function onPaginatorClicked(event) {
  'use strict'
  const page = event.target.innerHTML
  currentPage = page
  renderUsers(getDataByPage(currentPage))
})

//--------- event：layout panel clicked ----------------
layoutPanel.addEventListener('click', function onLayoutPanelClicked(event) {
  'use strict'
  //card mode
  if (event.target.matches('#card-button')) {
    changeLayOut('card-mode')
    renderUsers(getDataByPage(currentPage))

    //list mode
  } else if (event.target.matches('#list-button')) {
    changeLayOut('list-mode')
    renderUsers(getDataByPage(currentPage))

    //sort mode
  } else if (event.target.matches('#sort-button')) {
    const descending = event.target.classList.toggle('fa-arrow-up-a-z')
    currentPage = 1
    sortUsers(users, descending)
    renderUsers(getDataByPage(currentPage))

  }
})

//--------- event：tools clicked on navbar panel ----------------
toolPanel.addEventListener('click', function onToolPanelClicked(event) {
  'use strict'
  if (event.target.matches('#favorite-btn')) {
    !account ? alert('請先登入') : (window.location.href = 'favorite.html')
  } else if (event.target.matches('#notice-btn')) {
    !account ? alert('請先登入') : false
  }
})

//--------- event：login-button ----------------
login.addEventListener('click', function onLoginButtonClicked() {
  'use strict'
  localStorage.setItem('account', JSON.stringify([{
    id: 'test@gmail.com',
    password: 'test'
  }]))
})





//function 
//--------- function：render data on data panel ------
function renderUsers(users) {
  'use strict';
  let rawContent = ``;
  if (userPanel.dataset.mode === 'card-mode') {
    users.forEach((user) => {
      let userName = user.name + ' ' + user.surname;

      if (userName.length > 11) {
        let str = userName.slice(11)
        userName = userName.replace(str, '...')
      }

      rawContent += `
        <div class="col col-sm-4 col-md-3 col-lg-3">
          <div class="mb-4">
            <div id="user-card" class="text-center">
              <img src="${user.avatar}" alt="user-avatar">
              <ul class="user-info d-flex justify-content-around">
                  <li>
                    <img src="${FLAG_URL + user.region}" alt="" class="flag">
                    <span class="region">${user.region}</span>
                  </li>
                  <li>
                    <i class="fa-regular fa-heart btn-add-favorite" data-id="${user.id}"></i>
                  </li>
              </ul>
              <h5 id="card-title">${userName}</h5>
              <span id="btn-show-user" data-bs-toggle="modal" data-bs-target="#myModal" data-id="${user.id}">
                進一步了解
              </span>
            </div>
          </div>
        </div>
    `;
    });

  } else if (userPanel.dataset.mode === 'list-mode') {
    users.forEach((user) => {
      let userName = user.name + ' ' + user.surname;

      if (userName.length > 11) { //full name > 11 then replaced by '...'
        let str = userName.slice(11)
        userName = userName.replace(str, '...')
      }

      rawContent += `
        <div class="col col-lg-6">
          <div class="mb-4">
            <div id="user-list" class="text-center">
              <ul class="user-info d-flex justify-content-around align-items-center">
                <li><img src="${user.avatar}" alt="user-avatar"></li>
                <h5 class="card-title">${userName}</h5>
                <li>
                  <img src="${FLAG_URL + user.region}" alt="" class="flag">
                  <span class="region">${user.region}</span>
                </li>
                <span id="btn-show-user" data-bs-toggle="modal" data-bs-target="#myModal" data-id="${user.id}">
                  進一步了解
                </span>
                 <li>
                  <i class="fa-regular fa-heart btn-add-favorite" data-id="${user.id}"></i>
                </li>
              </ul>
            </div>
          </div>
        </div>
    `;
    });
  }

  userPanel.innerHTML = rawContent;
}

//--------- function：get show api's data -----
function getShowUrl(userId) {
  'use strict';
  // modal DOMs
  const modalTitle = document.querySelector("#modal-title");
  const modalData = document.querySelector("#modal-data");
  const modalImg = document.querySelector("#modal-img");
  let htmlContent = ``;

  // request show API
  axios
    .get(BASE_URL + userId)
    .then(function toModalData(response) {
      const userData = response.data;
      const userName = userData.surname + ` ${userData.name}`;
      htmlContent = `
            <li>age： ${userData.age}</li>
            <li>gender： ${userData.gender}</li>
            <li>email： ${userData.email}</li>
            <li>birthday： ${userData.birthday}</li>
            <li>region： <img src="${FLAG_URL + userData.region
        }" class="modal-flag"> ${userData.region}</li>
          `;
      modalTitle.innerText = userName;
      modalData.innerHTML = htmlContent;
      modalImg.innerHTML = `<img src=${userData.avatar}>`;
    })
    .catch((error) => {
      console.log(error);
    });
}

//--------- function：favorite add to localStorage ---
function addToLocalStorage(id) {
  'use strict'
  const newFavorite = users.find(user => user.id === id)

  if (favoriteList.some(user => user.id === id)) {
    return alert('已加入收藏') //if repeat then return 
  }

  favoriteList.push(newFavorite)
  localStorage.setItem("favoriteUsers", JSON.stringify(favoriteList))
}

//--------- function：remove favorite on data panel --------------
function removeLocalStorage(id) {
  'use strict'
  const removeId = favoriteList.findIndex(user => user.id === id)
  favoriteList.splice(removeId, 1)

  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
}

//--------- function：render paginator --------
function renderPaginator(amount) {
  'use strict'
  const paginator = document.querySelector('#paginator')
  const pageLen = Math.ceil(amount / PER_PAGE_DATA) //round up to nearest whole digit
  let rawHtml = ``

  for (let page = 1; page <= pageLen; page++) {
    rawHtml += `<li class="page-item"><a class="page-link" href="#">${page}</a></li>`
  }

  paginator.innerHTML = rawHtml
}

//--------- function：get data when paginator clicked ------
function getDataByPage(page) {
  'use strict'
  const data = filterUsers.length !== 0 ? filterUsers : users
  const startIndex = (page - 1) * PER_PAGE_DATA
  const endIndex = startIndex + PER_PAGE_DATA

  return data.slice(startIndex, endIndex)
}

//--------- function：change data panel mode -------
function changeLayOut(displayMode) {
  'use strict'
  if (userPanel.dataset.mode === displayMode) return //click same button

  userPanel.dataset.mode = displayMode
}

//--------- function：sort users -------------------
function sortUsers(users, descending) {
  'use strict'
  if (descending) {
    users.sort(function (user1, user2) {
      return user1.name.localeCompare(user2.name);
    });
  } else {
    users.sort(function (user1, user2) {
      return user2.name.localeCompare(user1.name);
    });
  }
}
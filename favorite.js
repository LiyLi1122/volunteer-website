//------------ initial variable --------------------
const favoriteList = JSON.parse(localStorage.getItem("favoriteUsers"))
const userPanel = document.querySelector("#user-panel");
const layoutPanel = document.querySelector('#layout-panel')

const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users/";
const FLAG_URL = "https://countryflagsapi.com/png/";
const account = JSON.parse(localStorage.getItem('account'))
const PER_PAGE_DATA = 12
const currentPage = 1


//event
//------------ event：user panel clicked -------------
userPanel.addEventListener("click", function onUserPanelClicked(event) {
  "use strict";
  const target = event.target;

  //show more user info
  if (target.matches("#btn-show-user")) {
    const userId = target.dataset.id;
    getShowUrl(userId);

    //delete id in localStorage
  } else if (target.matches(".btn-add-favorite")) {
    const userId = Number(target.dataset.id)
    deleteLocalStorage(userId)
  }

});

//------------ event：listen layout panel ----------------
layoutPanel.addEventListener('click', function onLayoutPanelClicked(event) {
  "use strict"
  //card-mode
  if (event.target.matches('#card-button')) {
    changeLayout('card-mode')
    renderFavoriteList(getDataByPage(currentPage))

    //list-mode
  } else if (event.target.matches('#list-button')) {
    changeLayout('list-mode')
    renderFavoriteList(getDataByPage(currentPage))

    //sort mode
  } else if (event.target.matches('#sort-button')) {
    const descending = event.target.classList.toggle('fa-arrow-up-a-z')
    sortUsers(favoriteList, descending)
    renderFavoriteList(getDataByPage(currentPage))
  }
})

//------------ event：paginator clicked ------------------
paginator.addEventListener('click', function onPaginatorClicked(event) {
  "use strict";
  const page = event.target.innerHTML
  renderFavoriteList(getDataByPage(page))
})





//function
//------------ function：user panel render --------------
function renderFavoriteList(favoriteList) {
  "use strict";
  let rawContent = ``;
  if (userPanel.dataset.mode === 'card-mode') {
    favoriteList.forEach((user) => {
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
                    <i class="fa-solid fa-heart btn-add-favorite" data-id="${user.id}"></i>
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
    favoriteList.forEach((user) => {
      let userName = user.name + ' ' + user.surname;

      if (userName.length > 11) {
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
                  <i class="fa-solid fa-heart btn-add-favorite" data-id="${user.id}"></i>
                </li>
              </ul>
            </div>
          </div>
        </div>
    `
    })
  }

  userPanel.innerHTML = rawContent;
}

//------------ function：get ShowUrl ---------
function getShowUrl(userId) {
  "use strict";
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

//------------ function：delete favorite in localStorage -------
function deleteLocalStorage(userId) {
  "use strict";
  const delIndex = favoriteList.findIndex(user => user.id === userId)
  favoriteList.splice(delIndex, 1)

  localStorage.setItem("favoriteUsers", JSON.stringify(favoriteList))
  renderFavoriteList(favoriteList)
}

//--------- function：render paginator ----------------------
function renderPaginator(amount) {
  "use strict";
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
  "use strict";
  const startIndex = (page - 1) * PER_PAGE_DATA
  const endIndex = startIndex + PER_PAGE_DATA

  return favoriteList.slice(startIndex, endIndex)
}

//--------- function：change data panel mode ---
function changeLayout(displayMode) {
  "use strict";
  if (userPanel.dataset.mode === displayMode) return //click same button

  userPanel.dataset.mode = displayMode
}

//--------- function：sort users --------------
function sortUsers(favoriteList, descending) {
  "use strict";
  if (descending) {
    favoriteList.sort(function (user1, user2) {
      return user1.name.localeCompare(user2.name);
    });
  } else {
    favoriteList.sort(function (user1, user2) {
      return user2.name.localeCompare(user1.name);
    });
  }
}

renderFavoriteList(favoriteList)
renderPaginator(favoriteList)

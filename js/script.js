const addBtn = document.querySelector('[data-btn="add"]')
const formMain = document.querySelector('#form-main')
const formChoice = document.querySelector('#form-choice')
const choiceItems = document.querySelectorAll('[data-choice]')
const textPercentItems = document.querySelectorAll('.form__choice-percent')
const formCart = document.querySelector('.form__cart')
const continueBtn = document.querySelector('[data-continue]')
const inputRadioItems = document.querySelectorAll('[data-choice] input')
const deleteBtnAll = document.querySelector("[data-btn='del']")
let formPrice = document.querySelector('.form__price')
const formSucceed = document.querySelector('#form-succeed')
const formError = document.querySelector('#form-error')
const btnSubmit = document.querySelector('[data-submit]')
const inputEmail = document.querySelector('[data-input="email"]')
const mainUrl = window.location.href;
function removeGreenClass() {
  for (let i = 0; i < textPercentItems.length; i++) {
    textPercentItems[i].classList.remove('green')
  }
}

document.body.addEventListener('click', function (e) {
  const target = e.target
  const choiceBtn = target.closest('[data-choice]')

  if (target.getAttribute('data-btn') === 'add') {
    formMain.classList.remove('active')
    formChoice.classList.add('active')
  }

  if (choiceBtn) {
    for (let i = 0; i < choiceItems.length; i++) {
      if (choiceBtn === choiceItems[i]) {
        const inputRadio = choiceBtn.querySelector('input')
        inputRadio.checked = true
        const textPercent = choiceBtn.querySelector('.form__choice-percent')
        if (textPercent) {
          removeGreenClass()
          textPercent.classList.add('green')
        }
      }
    }
  }
  if (target.getAttribute('data-btn') === 'continue') {
    for (let i = 0; i < inputRadioItems.length; i++) {
      if (inputRadioItems[i].checked) {
        const priceProduct = choiceItems[i].dataset.price
        const cntProduct = choiceItems[i].dataset.cnt
        cart.addToCart(priceProduct, cntProduct)
        inputRadioItems[i].checked = false
        removeGreenClass()
      }
    }
    cart.renderProducts()
    formChoice.classList.remove('active')
    formMain.classList.add('active')
  }

  if (target.dataset.btn === 'del') {
    const productId = Number(target.dataset.id)
    cart.removeFromCart(productId)
    cart.renderProducts()
  }

  if (target.dataset.btn === 'back') {
    formSucceed.classList.remove('active')
    formMain.classList.add('active')
    setMainUrl()
  }

  if (target.dataset.btn === 'again') {
    formError.classList.remove('active')
    formMain.classList.add('active')
    setMainUrl()
  }
})
// cart logic
const cart = {
  products: [],
  totalPrice: 0,
  addToCart(priceProduct, cntProduct) {
    for (let i = 0; i < cntProduct; i++) {
      this.products.push({
        price: priceProduct,
        id: Math.random(),
      })
    }
  },
  setTotalPrice() {
    console.log(cart.totalPrice)
    this.totalPrice = this.products.reduce((sum, pr) => {
      return sum + Number(pr.price)
    }, 0)
    formPrice.textContent = this.totalPrice
  },
  removeFromCart(id) {
    this.products = this.products.filter((pr) => pr.id !== id)
    console.log(this.products)
  },
  renderProducts() {
    formCart.innerHTML = ''
    if (!this.products.length) {
      formCart.insertAdjacentHTML('afterbegin', this.emptyTemplate())
    }
    let fragment = ''
    for (let i = 0; i < cart.products.length; i++) {
      const template = this.templateProduct(
        formCart.children.length + (i + 1),
        cart.products[i].id
      )
      fragment += template
    }
    this.setTotalPrice()
    formCart.insertAdjacentHTML('beforeend', fragment)
    console.log(this.products)
  },
  templateProduct(number, id) {
    return `
      <div class="form__product">
          <div class="form__product-header">
              <h4 class="form__product-title">Product <span class="form__product-number">${number}</span></h4>
              <button class="form__btn form__product-btn" data-btn="del" data-id="${id}"></button>
          </div>
          <div class="form__group">
            <label>Enter main keyword for the product</label>
            <input class="form__control" type="text" placeholder="for example, sylicon wine cup">
          </div>
          <div class="form__group">
            <label>Enter link to the similar product as a reference</label>
            <input class="form__control" type="text" placeholder="https://...">
          </div>
      </div>
    `
  },
  emptyTemplate() {
    return `
      <div class="form__notice">
          <h4 class="form__product-title" style="text-align:center;">Please add any products</h4>
      </div>
    `
  },
}
// cart.renderProducts()

function formValid() {
  if (inputEmail.value.length === 0) {
    inputEmail.style.borderColor = 'red'
    alert('input Email please')
    return false
  } else {
    inputEmail.style.borderColor = '#E1E3EE'
    return true
  }
}
function addQueryToUrl(type) {
  console.log(window.location.href)
  const url = type === 'success' ? `${mainUrl}/paymentsuccess` : `${mainUrl}/paymenterror`
  if (history.pushState) {
    window.history.pushState('', '', `${url}`)
  } else {
    document.location.href = `${url}`
  }
}
function setMainUrl() {
  if (history.pushState) {
    window.history.pushState('', '', `${mainUrl}`)
  } else {
    document.location.href = `${mainUrl}`
  }
}

const typeBtn = {
  load: `<img class="load" src="img/load-icon.svg" alt="snip">`,
  text: `Submit and Pay <span class="form__price">0</span>USD`,
}
formMain.addEventListener('submit', function (e) {
  e.preventDefault()
  if (formValid()) {
    const data = new FormData(formMain)
    data.append('cart', JSON.stringify(cart.products))
    btnSubmit.innerHTML = ""
    const loadData = () => {
      return new Promise((res, rej) => {
        btnSubmit.innerHTML = typeBtn.load
        setTimeout(() => {
          res(data)
        }, 1000)
      })
    }
    loadData()
      .then((data) => {
        if (history.pushState) {
          window.history.pushState('', '', '/paymentsuccess')
        } else {
          document.location.href = '/paymenterror'
        }
        addQueryToUrl('success')
        console.log(...data)
        formMain.classList.remove('active')
        formSucceed.classList.add('active')
      })
      .catch((res) => {
        console.log(res)
        formMain.classList.remove('active')
        formError.classList.add('active')
        addQueryToUrl('error')
      })
      .finally(() => {
        btnSubmit.innerHTML = typeBtn.text
        formPrice = btnSubmit.querySelector('.form__price')
        cart.products = []
        cart.renderProducts()
        formMain.reset()
      })
  }
})

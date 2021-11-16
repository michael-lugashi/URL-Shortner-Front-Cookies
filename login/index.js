'use strict'
import './style.css'
import {loggingIn, creatingAccount} from './modules/serverRequests'


loginForm.addEventListener('submit', loggingIn)
createAccountForm.addEventListener('submit', creatingAccount)

// function loggingIn(event){
//     event.preventDefault()
//     console.log(1)
// }
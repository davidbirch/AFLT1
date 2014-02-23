AFLT1::Application.routes.draw do
  root 'pages#home'
  get 'contact', to: 'pages#contact'
end

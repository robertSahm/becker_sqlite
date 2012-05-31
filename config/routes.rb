Becker::Application.routes.draw do

  # match checkout: 'checkouts'
  resources :checkouts

  resources :themes do
    collection { post :sort }
  end
  match '/about', to: 'main#about'
  resources :body_types  do
    collection { post :sort }
  end

  get "artists/display"

  resources :features do
    collection { post :sort }
  end
  resources :artists do
    collection { post :sort }
  end
  
  resources :options
  resources :instruments
 #  match ':controller(/:action(/:id(.:format)))'
  get "admins"  => 'admins#index'
  get "admin" => 'admins#index'

  controller :sessions do
    get     'login' => :new
    post    'login' => :create
    delete  'logout' => :destroy
  end

  resources :users

  resources :orders

  resources :carts

  resources :products do
    collection { post :sort }
  end
    

  resources :customers
  
  resources :line_items do
    put :decrement, on: :member
    put :increment, on: :member
  end

  resources :products
  
  
  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action
  match 'store' => 'store#index'
  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
  root to: 'main#index', as: '/'
  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.


  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  match ':controller(/:action(/:id(.:format)))'
end

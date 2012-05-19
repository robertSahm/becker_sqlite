class CreateCheckouts < ActiveRecord::Migration
  def change
    create_table :checkouts do |t|
      t.string  :first_name
      t.string  :last_name
      t.string  :phone
      t.string  :email
      t.string  :company
            
      t.text    :address
      t.string  :city
      t.string  :state      
      t.string  :country, :default => "US"
      t.string  :zip_code

      t.string  :first_name_ship
      t.string  :last_name_ship
      t.string  :company_ship      
      t.text    :address_ship
      t.string  :city_ship
      t.string  :state_ship      
      t.string  :country_ship, :default => "US"
      t.string  :zip_code_ship
      
      t.string   :delivery_type
      t.datetime :ship_date
      
      t.integer  :customer_id
      t.integer  :artist_id
      t.integer  :product_id
            
      t.text     :note
      t.string   :pay_type
      
      t.timestamps
    end
  end
end

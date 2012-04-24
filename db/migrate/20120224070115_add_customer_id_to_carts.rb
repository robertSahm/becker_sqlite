class AddCustomerIdToCarts < ActiveRecord::Migration
  def change
    add_column :carts, :customer_id, :integer
  end
end

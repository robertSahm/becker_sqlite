class AddCustomerIdToOrders < ActiveRecord::Migration
  def change
    add_column :orders, :customer_id, :integer
    add_column :orders, :artist_id,   :integer
  end
end

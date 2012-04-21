class AddBodyUrlToProducts < ActiveRecord::Migration
  def change
    add_column :products, :body_url, :string
  end
end

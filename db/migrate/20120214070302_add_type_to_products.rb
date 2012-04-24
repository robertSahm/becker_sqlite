class AddTypeToProducts < ActiveRecord::Migration
  def change
    add_column :products, :type_of, :string
  end
end

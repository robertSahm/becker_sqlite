class AddTypeOfToOptions < ActiveRecord::Migration
  def change
    add_column :options, :type_of, :string
  end
end

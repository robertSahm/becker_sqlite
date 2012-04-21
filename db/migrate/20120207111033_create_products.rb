class CreateProducts < ActiveRecord::Migration
  def change
    create_table :products do |t|
      t.string  :name
      t.text    :description
      t.string  :image_url

      t.decimal :price, precision: 8, scale: 2
#      t.money                                 # postgresQL data type
                                              # there is a default currency type in Postgresqlrake

      t.timestamps
    end
  end
end

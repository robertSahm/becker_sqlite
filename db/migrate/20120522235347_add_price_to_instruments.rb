class AddPriceToInstruments < ActiveRecord::Migration
  def change
    add_column :instruments, :price, :integer
  end
end

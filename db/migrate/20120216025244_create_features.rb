class CreateFeatures < ActiveRecord::Migration
  def change
    create_table :features do |t|
      t.string    :name
      t.integer   :position
    end
  end
end

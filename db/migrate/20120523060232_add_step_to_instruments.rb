class AddStepToInstruments < ActiveRecord::Migration
  def change
    add_column :instruments, :step, :string
    add_column :instruments, :type_of, :string
    add_column :instruments, :body, :string
    add_column :instruments, :body_type_id, :integer
  end
end

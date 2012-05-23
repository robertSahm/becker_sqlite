class AddFeaturesToInstruments < ActiveRecord::Migration
  def change
    add_column :instruments, :construction      , :integer
    add_column :instruments, :wood              , :integer
    add_column :instruments, :headstock         , :integer
    add_column :instruments, :top               , :integer
    add_column :instruments, :trimlays          , :integer
    add_column :instruments, :color             , :integer
    add_column :instruments, :finish            , :integer
    add_column :instruments, :neck              , :integer
    add_column :instruments, :strings           , :integer
    add_column :instruments, :scale             , :integer
    add_column :instruments, :curvature         , :integer
    add_column :instruments, :fingerboard       , :integer
    add_column :instruments, :frets             , :integer
    add_column :instruments, :pickups           , :integer
    add_column :instruments, :acoustic          , :integer
    add_column :instruments, :computer          , :integer
    add_column :instruments, :electronics       , :integer
    add_column :instruments, :hardware          , :integer
    add_column :instruments, :case              , :integer
    add_column :instruments, :insurance         , :integer
    add_column :instruments, :play_pack         , :integer
  end                                            
end                                               

class AddWebsiteToArtists < ActiveRecord::Migration
  def change
    add_column :artists, :website,    :string
    add_column :artists, :facebook,   :string
    add_column :artists, :twitter,    :string
    add_column :artists, :instagram,  :string
    add_column :artists, :blog,       :string
  end
end

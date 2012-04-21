class CreateArtists < ActiveRecord::Migration
  def change
    create_table  :artists do |t|
      t.string    :name
      t.string    :band
      t.text      :description
      t.string    :image_url
      t.string    :photo_url_1
      t.string    :photo_url_2
      t.string    :photo_url_3
      t.string    :youtube_1
      t.string    :youtube_2
      t.string    :youtube_3
      t.text      :note
    end
  end
end

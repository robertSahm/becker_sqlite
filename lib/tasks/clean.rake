TAG           = "_thumbh.jpg"
THUMB_FOLDER  = "Thumb H/"


namespace :pick do
  desc "Picks a Rondom Theme"
  task :theme => :environment do
    puts "Random Theme is #{pick(Theme).name}"
  end

  desc "Picks a Random Body Type"
  task :instr => :environment do
    puts "Random Body Type is #{pick(BodyType).name}"
  end
  
  desc "Picks a random theme and body type"
  task :all => [:theme, :instr]
  
  def pick(model_class)
    products = model_class.all
    new_array = products.shuffle
    instr = new_array.shift
  end
end
  
desc "Back ups the files in the images/artists folder to a backup folder"
task :backup_old => "tmp/backup" do
  IMAGES = FileList["app/assets/images/artists/*.*"]
  IMAGES.each do |p|
    cp p, "tmp/backup"
  end
end

desc "Moves tmp/backup/images folder to app/assets/images"
task :return  do
  mv "tmp/backup/images", "app/assets"
end

desc "Moves the contents of the images folder to tmp/backup"
task :backup_f => "tmp/backup" do
  mv "app/assets/images", "tmp/backup"
end

namespace :clean do  

  directory "tmp/backup"
  directory "app/assets/images"
  
  desc "Removes all images from the app/assets/images folder that are not in the database"  
  task :images => [:backup_f, "app/assets/images", :backup] do
    puts "the app/assets/images folder has been rebuilt ."
    puts "the previous image folder contents have been backed up in /tmp/backup/images"
    puts "please transfer this folder out of the RoR app file system onto your local system."
    puts "                        ******    IMPORTANT ***********"
    puts "Remember to copy the webphotos & thumbH folders on you own until this msg is removed"
    puts "                        ********************************"
  end
  
  desc "Get all photos from the database and copy them from tmp/backup to app/assets/images"
  task :backup => [:environment, "app/assets/images"]  do
    # IMAGES = FileList["app/assets/images/artists/*.*"]
    images = get_url
    i = 0
    n = images.count
    images.each do |p|
      folder, image_name = p.split("/") if p
      FileUtils.mkdir_p "app/assets/images/#{folder}"
      each_full_path = "tmp/backup/images/#{p}"
      cp each_full_path , "app/assets/images/#{folder}"
      i += 1
      puts "We have copied #{i} files of #{n}"
    end
  end
  
  desc "Moves the contents of the images folder to tmp/backup"
  task :backup_f => "tmp/backup"  do
    mv "app/assets/images", "tmp/backup"
  end
  
  task :back_test => :environment do
    path = "Thumb H/gal front copy_thumbh.jpg"
    folder, image_path = path.split('/')
    FileUtils.mkdir_p "app/assets/images/#{folder}"
    full_path = "tmp/backup/images/" + "Thumb H/gal front copy_thumbh.jpg"
    cp full_path , "app/assets/images/#{folder}"
  end
  
  def get_url
    images = []
    artists    = Artist.all
    body_types = BodyType.all
    products   = Product.all
    themes     = Theme.all
    tables = [artists, body_types, products, themes]
    tables.each do |t|
    	t.each do |i|
    	  images << i.image_url   if i.respond_to?(:image_url)
      	images << i.x_image_url if i.respond_to?(:x_image_url)
      	images << i.photo_url_1 if i.respond_to?(:photo_url_1)
      	images << i.photo_url_2 if i.respond_to?(:photo_url_2)
      	images << i.photo_url_3 if i.respond_to?(:photo_url_3)
      	images << i.photo_url_4 if i.respond_to?(:photo_url_4)
      	images << i.photo_url_5 if i.respond_to?(:photo_url_5)
      	images << i.photo_url_6 if i.respond_to?(:photo_url_6)
      	images << i.photo_url_7 if i.respond_to?(:photo_url_7)
      	images << i.photo_url_8 if i.respond_to?(:photo_url_8)
      	images << i.body_url    if i.respond_to?(:body_url)
      	images << i.thumb_url   if i.respond_to?(:thumb_url)
      	if i.class.to_s == "Product"
      	  # make a thumbnail url
      	  # folder, image_name = i.split('/')
      	  # thumb_string = THUMB_FOLDER + image_name + TAG  
      	end
      end
    end
    images.compact!
    images.select! { |i| !i.empty?}
    images.delete("Bloodwood Bass 1 copy.jpg")
    puts "*******  There are #{images.count} in the database"
    return images
  end 
end


# task list
# 
# 1.  move the images folder to the tmp/backup location :backup_f => 'tmp/backup'
# 2.  get all the photo urls from the database  get_url
# 3.  mk app/assets/images      'app/assets/images'
# 4.  cp each url to the app/assets/images folder :backup => :environment  
# 5.  print goodbye msg to move tmp backup  :images





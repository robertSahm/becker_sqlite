BodyType.delete_all

BodyType.create([ {name: "banjo", image_url: "webphotos/roller.png", type_of: "custom", price: 1200 },
  {name: "castlewave", image_url: "webphotos/castlewave.png", type_of: "guitar", price: 2800 },
  {name: "dark horse", image_url: "webphotos/darkhorse.png", type_of: "guitar", price: 2400 },
  {name: "hornet", image_url: "webphotos/imperialBrown.png", type_of: "guitar", price: 1900 },
  {name: "imperial", image_url: "webphotos/imperialBrown.png", type_of: "guitar", price: 1900 },
  {name: "mandolin", image_url: "webphotos/mando.png", type_of: "custom", price: 1500 },
  {name: "mantis", image_url: "webphotos/roller.png", type_of: "bass", price: 1800 },
  {name: "mistress", image_url: "webphotos/mistressH.png", type_of: "guitar", price: 2200 },
  {name: "roller", image_url: "webphotos/roller.png", type_of: "guitar", price: 1500 },
  {name: "twiggler", image_url: "webphotos/redBass.png", type_of: "bass", price: 1600 },
  {name: "waterfall", image_url: "webphotos/greenThing.png", type_of: "bass", price: 2000 },
  {name: "custom", image_url: "webphotos/greenThing.png", type_of: "custom", price: 1800} ])

bt_all_array = []
types = BodyType.all
types.each do |t|
  bt_all_array << t.id
end

Theme.delete_all

Theme.create(name: "Custom", price: 1500, display: true, image_url: "webphotos/greenThing.png", body_type_ids: bt_all_array)
Theme.create( name: "Natural", finish: "Oil", body: "Mahogany", neck: "Mahogany, neck-through 24.625' scale", headstock: "Matched to body", frets: "Bloodwood, purpleheart, ziricote, or cocobolo, 24 frets", electronics: "2 humbuckers, Master Volume, Master Tone, 3-way switch", hardware: "Chrome, tune-o-matic bridge, stop tailpiece", price: 2200, display: true, image_url: "webphotos/roller.png", body_type_ids: bt_all_array)
Theme.create(name: "GhostRider", finish: "Satin Lacquer", body: "Mahogany or Alder", neck: "Mahogany \-for mahogany body-\ or Maple \-for Alder body-\, neck-through 25 scale", headstock: "Matched to body", frets: "Bloodwood, Purpleheart, Ziricote or Cocobolo : 24 frets  + stainless zero Fret", electronics: "Two ndy Fran hot humbuckers with two volume and two tone controls,  two coil cuts and a three-way switch 
Two P90s with master volume, master tone, and a three-way switch", hardware: "Chrome, tune-o-matic  bridge, stop tailpiece", price: 2600, image_url: "webphotos/roller.png", display: true, body_type_ids: bt_all_array)
Theme.create(name: "HeadHunter", finish: "high gloss burst", body: "Mahogany w/Maple top", color: "BlackCherry Burst, Greenburst, Blueberry burst, Blackberry burst, Honey Nut burst, Seaburst, Chestnut burst, Natural" , neck: "Mahogany, neck-through 24.625 scale", headstock: "Ebony or Ziricote",  electronics: "two humbuckers with two volume and two tone controls with a three-way switch", hardware: "chrome, tune-o-matic bridge, stop tailpiece, knobs and pickup rings", price: 3600, display: true, image_url: "webphotos/roller.png", x_image_url: "webphotos/imperialH.png", thumb_url: "Thumb H/1black_thumbh.jpg", body_type_ids: bt_all_array)
Theme.create( name: "Chameleon", finish: "natural high gloss", body: "Mahogany", top: "Bookmatched or three-piece Bloodwood, Purpleheart, Ziricote, or Cocobolo" , neck: "Unaccented Mahogany or Maple, neck-through 25' scale", headstock: "", frets: "24 frets stainless zero fret", electronics: "Two humbuckers with two volume and two tone controls and a three-way switch", hardware: "matched wood hardware", price: 4500, display: true, image_url: "webphotos/roller.png", x_image_url: "webphotos/imperialH.png", thumb_url: "Thumb H/Jetson 1_thumbh.jpg", body_type_ids: bt_all_array)
Theme.create(name: "Nashville", finish: "natural", body: "Chambered Curly Maple with laminate accents", top: "three piece with Birdseye Maple sides and Cocobolo, Ziricote, Purpleheart, or Bloodwood center section" , neck: "seven piece Mahogany neck-through", headstock: "matched to top", frets: " Birdseye Maple bound with matching exotic choice: 24 frets +stainless zero fret", electronics: "Two humbuckers with two volume and two tone controls , two coil cuts and a three-way switch ", hardware: "Contrasting accented wood hardware", price: 6200, display: true, image_url: "webphotos/roller.png", x_image_url: "webphotos/imperialH.png", thumb_url: "Thumb H/Nashville 1_thumbh.jpg", body_type_ids: bt_all_array)
Theme.create( name: "House", finish: "Natural high gloss", body: "Mahogany or Ash with laminate accents", top: "Bookmatched or Three-Piece with Maple center section and Cocobolo, Ziricote, Purpleheart, Walnut, or Bloodwood sides" , neck: "seven piece Mahogany \with mahogany bodies\ or Maple \with Ash bodies\, neck-through", headstock: "matched to top", frets: "Bloodwood, Purpleheart, Ziricote, or Cocobolo: 24 frets ", electronics: "Two humbuckers with two volume and two tone controls and a three-way switch", hardware: "Matched wood hardware", price: 5400, display: true, image_url: "webphotos/imperialBrown.png", x_image_url: "webphotos/imperialH.png", thumb_url: "Thumb H/houseimperial3_thumbh.jpg", body_type_ids: bt_all_array)

Theme.create( name: "Native", finish: "Hand Rubbed Oil finish.", body: "Unaccented Mahogany Body", neck: "neck-through", headstock: "matched to top", frets: "Bloodwood, Purpleheart, Ziricote, or Cocobolo: 24 frets ", electronics: "lindy Fran passive 'Jazz' style pickups", price: 5400, display: true, image_url: "webphotos/mistressH.png", x_image_url: "webphotos/mistressH.png", thumb_url: "Thumb H/Bloodwood Bass 1_thumbh.jpg", body_type_ids: bt_all_array)

Theme.create( name: "Cosmic", finish: "High gloss lacquer finish", body: "Unaccented Mahogany Body", neck: "neck-through", top: "3pc. exotic wood", headstock: "matched to top", frets: "Bound figured Maple fretboard with matching position markers ", hardware: "Figured Maple pickup covers, bridge and knobs", electronics: "Active Bartoni pickups/circuit with PushButton rear access", price: 5400, display: true, image_url: "webphotos/redBass.png", x_image_url: "webphotos/redBass.png", thumb_url: "Thumb H/gal front copy_thumbh.jpg", body_type_ids: bt_all_array)

theme_all_array = []
types = Theme.all
types.each do |t|
  theme_all_array << t.id
end






Product.delete_all

Product.create(name: 'House Imperial',
  description: %{<p>
            - 9 Pc. Mahogany or Maple Thru-Neck Reinforced with cocobolo and maple accents\
            - Solid mahogany body sides accented with maple\
            - 3 Pc. cocobolo/ natural maple top and matching head-plate \
            - 24 Fret  bound cocobolo fretboard with 16" radius\
            - 2 cocobolo volume knobs and 2 cocobolo tone knobs\
            - cocobolo bridge with dual compensated bone saddles \
            - cocobolo 'HotDog' tailpiece\
            - cocobolo pickup mounting rings\
            - 2-seymour Duncan custom shop Becker-Buckers with etched covers\
            - 3 way pickup selector switch with cocobolo knob\
            - Gotoh 510 tuners\
            -pearl position markers and emblem\
            - Bone and nut saddles \
            - Hotrod dual action trussrod with coverless headstock access\
            - 24.625" scale length\
            - Finished natural in high gloss\
            </p>},
    image_url: 'webphotos/imperialBrown.png',
    price: 5499.00,
    type_of: 'guitar',
    feature: 'all',
    position: 2,
    x_image_url: 'webphotos/imperialH.png',
    body_type_id: BodyType.find_by_name("imperial").id,
    theme_id: Theme.find_by_name("House").id)

Product.create(name: 'Nashville',
  description: %{<p>
    -9 Pc. Mahogany Thru-Neck Reinforced with cocobolo and Maple Accents\
    -Chambered curly maple body sides\
    - 3 Pc. Birdseye Maple/ Cocobolo top and matching headplate\
    - 24 fret cocobolo bound BirdsEye Maple fret-board with 16" Radius\
    - 2 cocobolo volume knobs with pearl position markers\
    - stacked tone knobs in cocobolo and curly maple \
    - Nashville style Cocobolo/ BirdsEye Maple Tailpiece\
    -Cocobolo/ BirdsEye maple bridge with compensated bone saddles\
    - Cocobolo/ Birdseye Maple pickup mounting rings\
    -2 Seymour Duncan custom shop Becker- Buckers\
    -3 way pickup selector switch with cocobolo knob\
    - 2 Mini coil cut switches\
    - Gotoh 510 tuners\
    - Cocobolo position markers\
    - pearl side markers and emblem\
    - bone nut and saddles\
    -Hotrod dual action trussrod with coverless headstock access\
    - 25" scale length\
    - Finished natural in high gloss\
    </p>},
  image_url: 'webphotos/roller.png',
  price: 6000.00,
  type_of: 'guitar',
  feature: 'all',
  x_image_url: 'webphotos/rollerH.png',
  position: 3,
  body_type_id: BodyType.find_by_name("roller").id,
  theme_id: Theme.find_by_name("Nashville").id)

Product.create(name: 'CastleWave',
  description: %{<p>
    -9 Pc. Mahogany Thru-Neck Reinforced with cocobolo and Maple Accents\
    -Chambered curly maple body sides\
    - 3 Pc. Birdseye Maple/ Cocobolo top and matching headplate\
    - 24 fret cocobolo bound BirdsEye Maple fret-board with 16" Radius\
    - 2 cocobolo volume knobs with pearl position markers\
    - stacked tone knobs in cocobolo and curly maple \
    - Nashville style Cocobolo/ BirdsEye Maple Tailpiece\
    -Cocobolo/ BirdsEye maple bridge with compensated bone saddles\
    - Cocobolo/ Birdseye Maple pickup mounting rings\
    -2 Seymour Duncan custom shop Becker- Buckers\
    -3 way pickup selector switch with cocobolo knob\
    - 2 Mini coil cut switches\
    - Gotoh 510 tuners\
    - Cocobolo position markers\
    - pearl side markers and emblem\
    - bone nut and saddles\
    -Hotrod dual action trussrod with coverless headstock access\
    - 25" scale length\
    - Finished natural in high gloss\
    </p>},
  image_url: 'webphotos/castlewave.png',
  price: 6000.00,
  type_of: 'guitar',
  feature: 'all',
  x_image_url: 'webphotos/castlewaveH.png',
  position: 3,
  body_type_id: BodyType.find_by_name("castlewave").id,
  theme_id: Theme.find_by_name("Custom").id)

Product.create(name: 'Jetson',
  description: %{<p>
    5 pc. rock maple thruneck reinforced with bloodwood accents\
    -solid ash body sides with bloodwood accents\
    - 3pc. bloodwood/ curly maple top and matching headplate\
    - 24 fret bound bloodwood fretboard with 16" radius\
    -2 curly maple volume knobs with bloodwood position markers\
    -2 stacked tone knobs in curly maple and bloodwood\
    -bloodwood bridge with dual compensated bone saddles\
    - 3 way pickup selector switch with bloodwood knob\
    -2 mini coil cut switches \
    -gotoh 510 tuners \
    - pearl position markers and emblem \
    -bone nut and saddles \
    -hotrod dual action trussrod with coverless headstock access\
    -25.5" scale length \
    -Natural Finish in high gloss\
    </p>},
  image_url: 'webphotos/rollerBlueCustom.png',
  price: 4599.00,
  type_of: 'guitar',
  feature: 'all',
  x_image_url: 'webphotos/castlewaveH.png',
  position: 1,
  body_type_id: BodyType.find_by_name("roller").id,
  theme_id: Theme.find_by_name("Custom").id)
  
Product.create(name: 'Darkhorse',
  description: %{<p>
        - 5 Pc. Mahogany thru-neck reinforced with cocobolo and maple accents \
        - Solid mahogany body sides\
        - 2 Pc. cocobolo top and matching headplate\
        - 24 fret bound cocobolo fretboard with 14" Radius\
        -2 cocobolo volume knobs and 1 cocobolo stacked tone knobs\
        - cocobolo bridge with dual compensated bone saddles\
        -cocobolo tailpiece\
        -cocobolo pickup mounting rings\
        -2- Seymour duncan custom shop Becker- Buckers with etched covers\
        -3 way pickup selector switch with cocobolo knob\
        - Gotoh 510 tuners\
        - Pearl position markers and emblem\
        - Bone Nut and Saddles\
        -Hotrod dual action trussrod and coverless headstock access\
        - 24.625" scale length\
        -Finished in high gloss \
    </p>},
    image_url: 'webphotos/darkhorse.png',
    price: 5299.00,
    type_of: 'guitar',
    feature: 'all',
    x_image_url: 'webphotos/darkhorseH.png',
    position: 4,
    body_type_id: BodyType.find_by_name("dark horse").id,
    theme_id: Theme.find_by_name("Chameleon").id)

Product.create(name: 'Retro-Grad',
  description: %{<p>
      - Fully Contoured Mahogany body with mahogany  neck or adler body with maple neck\
      -0-22 Fret bolt-on (not screwed on) neck with 16" radius \
      -curly maple fretboard and pickguard\
      -Hotrod dual action truss rod with coverless headstock access\
      -2 Lindy Fralin Humbuckers\
      - Individual Volume and tone controls for each pickup\
      -3 way pickup selector switch \
      - 2- mini coil cut switches\
      -chrome hardware\
      -Grover mini rotomatic tuners\
      -Bone nut\
      -available in a variety of colors\
      -Smooth Satin finish\
      </p>},
    image_url: 'webphotos/darkhorse.png',
    price: 2299.00,
    type_of: 'guitar',
    x_image_url: 'webphotos/darkhorseH.png',
    feature: 'all',
    position: 5,
    body_type_id: BodyType.find_by_name("roller").id,
    theme_id: Theme.find_by_name("HeadHunter").id)
    
Product.create(name: 'Banjo',
  description: %{<p>- available in Purpleheart, bloodwood, cocobolo, or zircote\
  -available as a mandolin with a 14" scale or mandola with a 17" scale\
  -mahogany thru-neck and fully hollow mahogany body\
  -3 pc. purple heart and birdseye maple top\
  -22 fret bound purpleheart fretboard with a 14" radius and zero fret\
  -Purpleheart finger rest with "B" inlaw\
  -mistress style bridge and tailpiece with compensated bone saddle\
  -grover and rotomatics tuners\
  -pearl position markers on a purpleheart fretboard\
  -bone nut and saddles\
  -finished in high  gloss with bursted back</p>},
    image_url: 'webphotos/darkhorse.png',
    price: 3599.00,
    type_of: 'custom',
    feature: 'all',
    position: 6,
    body_type_id: BodyType.find_by_name("banjo").id,
    theme_id: Theme.find_by_name("Natural").id)

Product.create(name: 'LapSteel',
  description: %{ add description here ...},
    image_url: 'webphotos/darkhorse.png',
    price: 2900.00,
    type_of: 'custom',
    feature: 'all',
    x_image_url: 'webphotos/darkhorseH.png',
    position: 7,
    body_type_id: BodyType.find_by_name("custom").id,
    theme_id: Theme.find_by_name("Custom").id)


Product.create(name: 'Bloodwood',
  description: %{<p>- available in Purpleheart, bloodwood, cocobolo, or zircote\
  -available as a mandolin with a 14" scale or mandola with a 17" scale\
  -mahogany thru-neck and fully hollow mahogany body\
  -3 pc. purple heart and birdseye maple top\
  -22 fret bound purpleheart fretboard with a 14" radius and zero fret\
  -Purpleheart finger rest with "B" inlaw\
  -mistress style bridge and tailpiece with compensated bone saddle\
  -grover and rotomatics tuners\
  -pearl position markers on a purpleheart fretboard\
  -bone nut and saddles\
  -finished in high  gloss with bursted back</p>},
    image_url: 'webphotos/redBass.png',
    price: 2600,
    type_of: 'bass',
    feature: 'all',
    x_image_url: 'webphotos/redBass.png',
    position: 9,
    body_type_id: BodyType.find_by_name("twiggler").id,
    theme_id: Theme.find_by_name("Custom").id)
      
        
Product.create(name: 'Mantis',
  description: %{<p>- available in Purpleheart, bloodwood, cocobolo, or zircote\
  -available as a mandolin with a 14" scale or mandola with a 17" scale\
  -mahogany thru-neck and fully hollow mahogany body\
  -3 pc. purple heart and birdseye maple top\
  -22 fret bound purpleheart fretboard with a 14" radius and zero fret\
  -Purpleheart finger rest with "B" inlaw\
  -mistress style bridge and tailpiece with compensated bone saddle\
  -grover and rotomatics tuners\
  -pearl position markers on a purpleheart fretboard\
  -bone nut and saddles\
  -finished in high  gloss with bursted back</p>},
    image_url: 'webphotos/redBass.png',
    price: 6900.0,
    type_of: 'bass',
    x_image_url: 'webphotos/redBass.png',
    feature: 'all',
    position: 8,
    body_type_id: BodyType.find_by_name("mantis").id,
    theme_id: Theme.find_by_name("Cosmic").id)

Product.create(name: 'Thing',
  description: %{<p>- available in Purpleheart, bloodwood, cocobolo, or zircote\
  -available as a mandolin with a 14" scale or mandola with a 17" scale\
  -mahogany thru-neck and fully hollow mahogany body\
  -3 pc. purple heart and birdseye maple top\
  -22 fret bound purpleheart fretboard with a 14" radius and zero fret\
  -Purpleheart finger rest with "B" inlaw\
  -mistress style bridge and tailpiece with compensated bone saddle\
  -grover and rotomatics tuners\
  -pearl position markers on a purpleheart fretboard\
  -bone nut and saddles\
  -finished in high  gloss with bursted back</p>},
    image_url: 'webphotos/greenThing.png',
    price: 6900.0,
    type_of: 'bass',
    x_image_url: 'webphotos/greenThing.png',
    feature: 'all',
    position: 8,
    body_type_id: BodyType.find_by_name("custom").id,
    theme_id: Theme.find_by_name("Natural").id) #DONE


Product.create(name: 'Ghost',
  description: %{<p>- available in Purpleheart, bloodwood, cocobolo, or zircote\
  -available as a mandolin with a 14" scale or mandola with a 17" scale\
  -mahogany thru-neck and fully hollow mahogany body\
  -3 pc. purple heart and birdseye maple top\
  -22 fret bound purpleheart fretboard with a 14" radius and zero fret\
  -Purpleheart finger rest with "B" inlaw\
  -mistress style bridge and tailpiece with compensated bone saddle\
  -grover and rotomatics tuners\
  -pearl position markers on a purpleheart fretboard\
  -bone nut and saddles\
  -finished in high  gloss with bursted back</p>},
    image_url: 'webphotos/mando.png',
    price: 4100,
    type_of: 'custom',
    feature: 'all',
    x_image_url: 'webphotos/mando.png',
    position: 10,
    body_type_id: BodyType.find_by_name("mandolin").id,
    theme_id: Theme.find_by_name("GhostRider").id)

Product.create(name: 'Hornet',
  description: %{<p>- available in Purpleheart, bloodwood, cocobolo, or zircote\
  -available as a mandolin with a 14" scale or mandola with a 17" scale\
  -mahogany thru-neck and fully hollow mahogany body\
  -3 pc. purple heart and birdseye maple top\
  -22 fret bound purpleheart fretboard with a 14" radius and zero fret\
  -Purpleheart finger rest with "B" inlaw\
  -mistress style bridge and tailpiece with compensated bone saddle\
  -grover and rotomatics tuners\
  -pearl position markers on a purpleheart fretboard\
  -bone nut and saddles\
  -finished in high  gloss with bursted back</p>},
    image_url: 'webphotos/hornet.png',
    price: 4100,
    type_of: 'custom',
    feature: 'all',
    x_image_url: 'webphotos/hornet.png',
    position: 10,
    body_type_id: BodyType.find_by_name("hornet").id,
    theme_id: Theme.find_by_name("Natural").id) # DONE

product_all_array = []
types = Product.all
types.each do |t|
  product_all_array << t.id
end



Feature.delete_all

Feature.create([
  {name: "Body Style",      position: 1},
  {name: "Construction",    position: 2},
  {name: "Color Theme",     position: 3},
  {name: "Hardware",        position: 4},
  {name: "Pickups",         position: 5},
  {name: "Acoustic Pickup", position: 6},
  {name: "Computer Pickup", position: 7},
  {name: "Case",            position: 8},
  {name: "Insurance",       position: 9}  ])


Option.delete_all

options_all   = [["Body Style", "bolt on neck - solid body", 0, true, true],
 ["Body Style", "neck thru - solid body", 400, false, true],
  ["Body Style", "half chamber", 800, false, true],
   ["Body Style", "full chamber", 1200, false, true],
    ["Construction", "22 fret standard", 0, true, true],
     ["Construction", "24 fret", 300, false, true], 
     ["Construction", "22 fret - Becker logo inlays", 600, false, true],
      ["Construction", "24 fret - Becker logo inlays", 900, false, true],
       ["Color Theme", "Oil Stain", -100, false, true],
        ["Color Theme", "Single Color Stain", 0, true, true],
         ["Color Theme", "Nashville", 1200, false, true], 
         ["Color Theme", "House", 40, false, true],
          ["Color Theme", "GhostRider", 600, false, true],
           ["Color Theme", "HeadHunter", 100, false, true],
            ["Color Theme", "Chameleon", 1000, false, true],
             ["Hardware", "Metal", 0, true, true],
              ["Hardware", "Wood", 100, false, true],
               ["Hardware", "Bone", 300, false, true],
                ["Pickups", "3 Single Coils", 0, true, true],
                 ["Pickups", "2 Single Coils and a Humbucker", 200, false, true],
                  ["Pickups", "2 Classic Humbuckers", 100, false, true],
                   ["Pickups", "2 Becker Bucker Humbuckers", 200, false, true],
                    ["Acoustic Pickup", "Off", 0, true, true],
                     ["Acoustic Pickup", "Built into Bridge location", 200, false, true],
                      ["Acoustic Pickup", "Custom location", 400, false, true],
                       ["Computer Pickup", "Off", 0, true, true],
                        ["Computer Pickup", "Roland G-Series Pickup", 700, false, true],
                         ["Computer Pickup", "Axon System", 900, false, true],
                          ["Case", "Hardshell Custom", 0, true, true],
                           ["Case", "Softcase", -50, false, true],
                            ["Case", "Off", -100, false, true],
                             ["Insurance", "Off", 0, true, true],
                              ["Insurance", "On", 300, false, true]]

num           = options_all.count
num.times do |n|
  feature     = options_all[n][0]
  feat_id     = Feature.find_by_name(feature).id
  descr       = options_all[n][1]
  price       = options_all[n][2]
  deflt       = options_all[n][3]
  op_new      = Option.create(description: descr, price: price, default: deflt, display: true, feature_id: feat_id, body_type_ids: bt_all_array, theme_ids: theme_all_array, product_ids: product_all_array)
end

Artist.delete_all

Artist.create([
  {name: "Jeff Lawson", band: "ChainDrive", description: "Jeff plays guitar in alternative rock band ChainDrive. He has been a Becker artist since 2011. He plays a GhostRider Roller.", website: "www.chaindriverocks.com", image_url: "artists/lawson1.jpg"},
 {name: "Rob Taylor", band: "", description: "Rob Taylor is a pop singer/songwriter from Connecticut. He has been playing Becker Guitars since\
	2007 and owns several instruments including 6 string guitars, basses, a mandolin and an electric Banjo.\
	Becker Martin Instruments can be heard throughout his albums -Sun in a Box - Come
	Down Never, and his upcoming release, Imperfectly Sound", website: "www.robtaylor.com", facebook: "www.facebook.com/#!/pages/Rob-Taylor/128104770662", image_url: "artists/Rob Taylor Artist Page Photo.jpg"},
{name: "Kevin MacKenzie", band: "The Few", description: "Kevin and Ryan make up the string section of Boston based VintageRock band The Few. Kevin was introduced to our line in 2009, shortly after meeting Ryan. Magic was once again crafted and today Kevin plays a GhostRider Roller known as \'91Granny Smith\'92. Ryan\'92s flavor of the week is a custom 6 string Mantis.", website: "www.thefewmusic.net", image_url: "artists/The Few Kevin.png"},
{name: "Ryan Martin", band: "The Few", description: "Crafts custom made instruments for Becker Martin Instruments when he is not jamming with 'The Few'", website: "www.thefewmusic.net", image_url: "Logos/RyanLogosmall.jpg"},
{name: "Andrew Provine", band: "AV8R", description: "Andrew Provine is AV8R, a one-man electronic/DJ/live guitar act. He\'92s been a Becker artist since 2011. Andrew plays a HeadHunter CastleWave with all MIDI electronics.", website: "www.myspace.com/prosizzle", image_url: "artists/av8r.jpg"},
{name: "Ryan Stasik", band: "Umphrey's McGee", description: "Bassist for Umphrey\'92s McGee, Ryan has been a RMB artist since early 2011. He plays a custom LoRyder bass.", website: "www.umphreys.com", image_url: "artists/Ryan Stasik.jpg"},
{name: "Dave Drouin", band: "The Brew", description: "Dave plays guitar in Boston-based indie rock band The Brew. He has played our instruments since 2009. He has performed with a GhostRider Roller and a HeadHunter Imperial.", website: "www.thebrew.biz", image_url: "artists/Drouin1.png"},
{name: "Jake Cinninger", band: "Umphrey's McGee", description: "Jake plays lead guitar for progressive jam band Umphrey\'92s McGee. We met the band in 2008, and Jake has played a variety of our guitars since. In 2009 we finished his fully custom Roller, \'93Mother Earth.\'94", website: "www.umphreys.com", image_url: "artists/Jake Resized.jpg"},
{name: "Jon Gutwillig", band: "Disco Biscuits", description: "Lead guitarist and vocalist for electronic/jam band the Disco Biscuits, Jon is our longest-standing artist. He has been playing our instruments since we first met in 2008. Jon uses a custom MIDI Imperial A P90 GhostRider as well as several Rollers and Mistresses.", website: "www.thediscobiscuits.com", facebook: "www.facebook.com/TheRealBarber", twitter: "@barbershreds", instagram: "barbershreds", image_url: "artists/barber1.jpg"},
{name: "Marc Brownstein", band: "Disco Biscuits", description: "Marc plays bass for the Disco Biscuits. He has played several of our basses  since 2008. He is currently playing a LoRyder bass.", website: "www.thediscobiscuits.com", image_url: "artists/MarcBrownstein.png"},
{name: "Chuck Garvey", band: "moe.", description: "Chuck is the lead guitarist from prog rockers/jam band moe. He has been playing our guitars since 2010. Right now, Chuck plays two GhostRider Rollers, one with P90s and one with humbuckers.", website: "www.moe.org", image_url: "artists/ChuckGarvey.png"},
{name: "Mihali 'Mickey' Savoulidis", band: "Twiddle", description: "Mickey plays guitar in Vermont-based jam band Twiddle. He has played a variety of Hornets since 2010.", website: "www.twiddle.com", image_url: "artists/Mickey.jpg"},
{name: "Justin Hasting", band: "Zoogma", description: "\Justin is the guitar player for electronic/rock group Zoogma. He has been using our instruments since 2009. He currently plays a custom GhostRider Roller.", website: "www.zoogma.net", image_url: "artists/justin Hasting.jpg"},
{name: "Patrick Hayes", band: "", description: "Pat is a platinum R&B producer and has played guitar for groups including B.B. King, The Black Eyed Peas, and R. Kelly. He has been using a Becker Hornet since 2009.", website: "www.facebook.com/patrickguitarboy", image_url: "artists/Pat Hayes.jpg"}])




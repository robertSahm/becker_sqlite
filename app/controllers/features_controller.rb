class FeaturesController < ApplicationController

  def index
    @features = Feature.order("position ASC")

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @features }
    end
  end

  def show
    @feature = Feature.find(params[:id])
    @list = get_options(@feature)
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @feature }
    end
  end

  def new
    @feature = Feature.new
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @feature }
    end
  end

  def edit
    @feature = Feature.find(params[:id])
    @list = get_options(@feature)
  end

  def create
    @feature = Feature.new(params[:feature])

    respond_to do |format|
      if @feature.save
        format.html { redirect_to features_path, notice: 'Feature was successfully created.' }
        format.json { render json: @feature, status: :created, location: @feature }
      else
        format.html { render action: "new" }
        format.json { render json: @feature.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @feature = Feature.find(params[:id])

    respond_to do |format|
      if @feature.update_attributes(params[:feature])
        format.html { redirect_to features_path, notice: 'Feature was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @feature.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def sort
    params[:feature].each_with_index do |id, index|
      Feature.update_all({position: index}, {id: id})
    end
    render nothing: true
  end

  def delete
    @feature = Feature.find(params[:id])
    @feature.destroy

    respond_to do |format|
      format.html { redirect_to features_url }
      format.json { head :ok }
    end
  end
  
  def get_options(feature)
    start = Option.where(feature_id: feature.id)
    h = {}
    start.each do |s| 
       h[s.description] = 1
    end
    a = h.keys
    list = []
    a.each do |it|
      list << Option.find_by_description(it)
    end
    return list
  end
end

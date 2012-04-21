class BodyTypesController < ApplicationController

  def index
    @body_types = BodyType.order('position ASC')
    @features   = Feature.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @body_types }
    end
  end

  def show
    @body_type = BodyType.find(params[:id])
    @themes = @body_type.themes
    if @themes.nil?
      @themes = []
    end

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @body_type }
    end
  end

  def new
    @body_type  = BodyType.new
    @themes     = Theme.all
      
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @body_type }
    end
  end

  def edit
    @body_type  = BodyType.find(params[:id])
    @themes     = Theme.all
  end

  def create
    @body_type = BodyType.new(params[:body_type])

    respond_to do |format|
      if @body_type.save
        format.html { redirect_to body_types_path, notice: 'Body type was successfully created.' }
        format.json { render json: @body_type, status: :created, location: @body_type }
      else
        format.html { render action: "new" }
        format.json { render json: @body_type.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @body_type = BodyType.find(params[:id])

    respond_to do |format|
      if @body_type.update_attributes(params[:body_type])
        format.html { redirect_to body_types_path, notice: 'Body type was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @body_type.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def sort
    params[:body_type].each_with_index do |id, index|
      BodyType.update_all({position: index}, {id: id})
    end
    render nothing: true
  end

  def delete
    @body_type = BodyType.find(params[:id])
    @body_type.destroy

    respond_to do |format|
      format.html { redirect_to body_types_url }
      format.json { head :ok }
    end
  end
end

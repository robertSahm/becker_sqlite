class ArtistsController < ApplicationController

  def index
    @artists = Artist.order("position ASC")

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @artists }
    end
  end

  def show
    @artist = Artist.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @artist }
    end
  end

  def new
    @artist = Artist.new
    @page_title = "Artist New"

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @artist }
    end
  end

  def edit
    @artist = Artist.find(params[:id])
    @page_title = "Artist Edit"
  end

  def create
    @artist = Artist.new(params[:artist])

    respond_to do |format|
      if @artist.save
        format.html { redirect_to @artist, notice: 'artist was successfully created.' }
        format.json { render json: @artist, status: :created, location: @artist }
      else
        format.html { render action: "new" }
        format.json { render json: @artist.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @artist = Artist.find(params[:id])

    respond_to do |format|
      if @artist.update_attributes(params[:artist])
        format.html { redirect_to @artist, notice: 'artist was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @artist.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def sort
    params[:artist].each_with_index do |id, index|
      Artist.update_all({position: index}, {id: id})
    end
    render nothing: true
  end

  def destroy
    @artist = Artist.find(params[:id])
    @artist.destroy

    respond_to do |format|
      format.html { redirect_to artists_url }
      format.json { head :ok }
    end
  end
end


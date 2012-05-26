class InstrumentsController < ApplicationController

  def update
    @instrument = Instrument.find(params[:id])
    case params[:step]
    when 'paint'
      
      @instrument.update_attributes(step: params[:step], 
        price:        params[:price],
        construction: params[:construction],
        wood:         params[:wood], 
        headstock:    params[:headstock], 
        top:          params[:top], 
        trimlays:     params[:trimlays])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id 
    when 'neck'
      @instrument.update_attributes(step: params[:step], 
        price:  params[:price],
        color:  params[:color], 
        finish: params[:finish])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    when 'electronics'
      @instrument.update_attributes(step: params[:step], 
        price:       params[:price],
        neck:        params[:neck],
        strings:     params[:strings], 
        scale:       params["scale-length"], 
        curvature:   params[:curvature], 
        fingerboard: params[:fingerboard], 
        frets:       params[:frets])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    when 'accessories'
      @instrument.update_attributes(step: params[:step], 
        price:       params[:price],
        pickups:     params[:pickups],
        acoustic:    params["acoustic-pickup"],
        computer:    params["computer-pickup"],
        electronics: params[:electronics],
        hardware:    params[:hardware] )
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    when 'complete'
      @instrument.update_attributes(step: params[:step],  
        price:     params[:price],
        :case =>   params[:case],
        play_pack: params["play-pack"],
        insurance: params[:insurance])
      redirect_to controller: 'store', action: 'overview', id: @instrument.id
    end

  end


end
defmodule FuudWeb.PageLive do
  use FuudWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(
       :food_trucks,
       Fuud.filter_food_trucks_by_food("")
     )
     |> assign(:food_search, nil)}
  end

  @impl true
  def handle_event("search-food", %{"food" => food}, socket) do
    {:noreply,
     socket
     |> assign(:food_trucks, Fuud.filter_food_trucks_by_food(food))
     |> assign(:food_search, food)}
  end
end

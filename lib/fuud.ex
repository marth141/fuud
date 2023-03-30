defmodule Fuud do
  @moduledoc """
  Used for getting filters of food trucks from the Sfgov API.
  """

  @doc """
  Filters food trucks given a string by food items.

  I was thinking this would be really useful for figuring out something someone might actually want to eat.
  """
  def filter_food_trucks_by_food("") do
    get_approved_food_trucks()
    |> format_json()
  end

  def filter_food_trucks_by_food(filter) do
    get_approved_food_trucks()
    |> Enum.filter(fn ft ->
      Regex.match?(~r/#{filter}/i, ft["fooditems"])
    end)
    |> format_json()
  end

  # Formats the food truck information into json.
  # This makes it easier to work with on the frontend map.
  defp format_json(arg) do
    Jason.encode!(arg)
  end

  # Gets all of the approved food trucks from SfgovApi.
  # Upon inspection of the data, I figured no one would want to see food trucks that have yet to be approved.
  defp get_approved_food_trucks do
    with {:ok, %{body: body, status: 200}} <- SfgovApi.get_approved_mobile_food_facility_permits() do
      simplify_results(body)
    end
  end

  # The food truck results from Sfgov come with a lot of information.
  # However, of all the information received, I think that
  # ["status", "applicant", "latitude", "longitude", "fooditems", "schedule", "address"]
  # are probably the most relevant. Status to know it's approved (or not),
  # applicant to know whose food truck, latitude and longitude to put on a map,
  # fooditems to know what food the truck has, schedule to know when they operate,
  # and address to know where to find the food truck in a more human way than latitude and longitude.
  defp simplify_results(body) do
    body = Jason.decode!(body)
    keys = body |> List.first() |> Map.keys()

    body
    |> Enum.map(fn o ->
      Map.drop(
        o,
        keys --
          ["status", "applicant", "latitude", "longitude", "fooditems", "schedule", "address"]
      )
    end)
  end
end

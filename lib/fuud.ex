defmodule Fuud do
  @moduledoc """
  Used for getting filters of food trucks from the Sfgov API.
  """

  @doc """
  Filters food trucks given a string by food items.
  """
  def filter_food_trucks_by_food(filter) do
    get_approved_food_trucks()
    |> Enum.filter(fn ft ->
      Regex.match?(~r/#{filter}/i, ft["fooditems"])
    end)
    |> format_json()
  end

  def filter_food_trucks_by_food("") do
    get_approved_food_trucks()
    |> format_json()
  end

  defp format_json(arg) do
    Jason.encode!(arg)
  end

  defp get_approved_food_trucks do
    with {:ok, %{body: body, status: 200}} <- SfgovApi.get_approved_mobile_food_facility_permits() do
      simplify_results(body)
    end
  end

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

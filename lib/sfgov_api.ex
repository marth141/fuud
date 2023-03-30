defmodule SfgovApi do
  @moduledoc """
  Used as kind of an interface for Sfgov's API.
  """

  @doc """
  Gets approved mobile food trucks from Sfgov's API.

  More info here https://dev.socrata.com/consumers/getting-started.html
  """
  def get_approved_mobile_food_facility_permits() do
    Finch.build(:get, URI.encode("https://data.sfgov.org/resource/rqzj-sfat.json?$where=status == 'APPROVED'"))
    |> Finch.request(MyFinch)
  end
end

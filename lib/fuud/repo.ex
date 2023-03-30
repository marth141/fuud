defmodule Fuud.Repo do
  use Ecto.Repo,
    otp_app: :fuud,
    adapter: Ecto.Adapters.Postgres
end

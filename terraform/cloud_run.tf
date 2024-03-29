resource "google_project_service" "run" {
  service = "run.googleapis.com"
}

resource "google_cloud_run_service" "movies-telegram-bot" {
  name     = "movies-telegram-bot"
  location = "us-central1"

  template {
    spec {
      containers {
        image = var.container_image
        env {
          name = "BOT_TOKEN"
          value = var.bot_token
        }
        env {
          name = "LAMBDA_URL"
          value = var.lambda_url
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.run]
}

resource "google_cloud_run_service_iam_member" "allUsers" {
  service  = google_cloud_run_service.movies-telegram-bot.name
  location = google_cloud_run_service.movies-telegram-bot.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
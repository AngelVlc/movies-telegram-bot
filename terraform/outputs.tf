output "url" {
  value = google_cloud_run_service.movies-telegram-bot.status[0].url
}

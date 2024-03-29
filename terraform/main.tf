terraform {
  required_version = ">= 0.12"

  required_providers {
    google = ">= 3.3"
  }

  backend "gcs" {
    bucket  = "terraform-moviestelegrambot"
    prefix  = "state"
  }
}

provider "google" {
  project = var.project_id
}


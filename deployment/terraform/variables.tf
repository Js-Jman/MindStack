variable "project_name" {
  description = "Prefix for Azure resources"
  type        = string
  default     = "mindstack"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "admin_username" {
  description = "Admin username for Linux VM"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  description = "SSH public key content"
  type        = string
  default     = null
  nullable    = true
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file (for example C:/Users/<user>/.ssh/id_ed25519.pub)"
  type        = string
  default     = ""
}

variable "vm_size" {
  description = "Azure VM size"
  type        = string
  default     = "Standard_B2s"
}

variable "vnet_cidr" {
  description = "Virtual network CIDR"
  type        = string
  default     = "10.20.0.0/16"
}

variable "subnet_cidr" {
  description = "Subnet CIDR"
  type        = string
  default     = "10.20.1.0/24"
}

variable "private_vm_ip" {
  description = "Static private IP for VM NIC"
  type        = string
  default     = "10.20.1.10"
}

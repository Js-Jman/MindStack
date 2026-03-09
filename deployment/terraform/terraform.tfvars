project_name   = "mindstack"
location       = "southeastasia"
admin_username = "azureuser"
vm_size        = "Standard_B2s_v2"

# Keep this private CIDR aligned with your network policy
vnet_cidr    = "10.20.0.0/16"
subnet_cidr  = "10.20.1.0/24"
private_vm_ip = "10.20.1.10"

# Preferred: point to your local public key file.
ssh_public_key_path = "C:/Users/RAbishek/.ssh/id_ed25519.pub"

# Optional: provide key inline instead of file path.
# ssh_public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... your-key"

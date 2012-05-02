# Get the directory that this configuration file exists in
dir = File.dirname(__FILE__)

# Compass configurations
sass_path = dir
css_path = File.join(dir, "..")

# Require any additional compass plugins here.
images_dir = File.join(dir, "..", "..", "images")

# change to :compressed for production
output_style = :expanded
# change to :production for production
environment = :development

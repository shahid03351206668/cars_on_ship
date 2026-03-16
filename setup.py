from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in cars_on_ship/__init__.py
from cars_on_ship import __version__ as version

setup(
	name="cars_on_ship",
	version=version,
	description="Car import platform",
	author="Codes Soft",
	author_email="Info@codessoft.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)

## Creating backups of DB and Storage

```
DATESTAMP=$(date +"%Y-%m-%d_%H-%M-%S") && \
SOURCE_BUCKET="PUT_HERE_VALUE" && \
BACKUP_BUCKET="PUT_HERE_VALUE" && \
gsutil -m cp -r $SOURCE_BUCKET/* $BACKUP_BUCKET/$DATESTAMP/storage/ && \
gcloud firestore export $BACKUP_BUCKET/$DATESTAMP/db/
```

## Applying Storage backup and DB backup

```
BACKUP_FOLDER="PUT_HERE_FOLDER_NAME" && \
SOURCE_BUCKET="PUT_HERE_VALUE" && \
BACKUP_BUCKET="PUT_HERE_VALUE" && \
gsutil ls $SOURCE_BUCKET && \
gsutil -m rm -r $SOURCE_BUCKET/* || echo "Bucket is empty, skipping removal." && \
gsutil -m cp -r $BACKUP_BUCKET/$BACKUP_FOLDER/storage/* $SOURCE_BUCKET/ && \
gcloud firestore import $BACKUP_BUCKET/$BACKUP_FOLDER/db/
```
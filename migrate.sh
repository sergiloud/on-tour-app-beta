#!/bin/bash

# Migration Helper Script
# Quick commands for running Firestore migrations

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Firestore Migration Helper${NC}\n"

# Check if user provided arguments
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./migrate.sh dry-run <userId> <orgId>    # Test migration without changes"
    echo "  ./migrate.sh migrate <userId> <orgId>    # Run actual migration"
    echo "  ./migrate.sh help                        # Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./migrate.sh dry-run abc123 org456"
    echo "  ./migrate.sh migrate abc123 org456"
    exit 0
fi

COMMAND=$1
USER_ID=$2
ORG_ID=$3

case $COMMAND in
    "dry-run")
        if [ -z "$USER_ID" ] || [ -z "$ORG_ID" ]; then
            echo -e "${RED}Error: userId and orgId required${NC}"
            echo "Usage: ./migrate.sh dry-run <userId> <orgId>"
            exit 1
        fi
        
        echo -e "${YELLOW}Running DRY RUN migration...${NC}"
        echo "User ID: $USER_ID"
        echo "Org ID: $ORG_ID"
        echo ""
        
        npm run migrate:subcollections -- --userId=$USER_ID --orgId=$ORG_ID --dryRun
        ;;
        
    "migrate")
        if [ -z "$USER_ID" ] || [ -z "$ORG_ID" ]; then
            echo -e "${RED}Error: userId and orgId required${NC}"
            echo "Usage: ./migrate.sh migrate <userId> <orgId>"
            exit 1
        fi
        
        echo -e "${RED}⚠️  LIVE MIGRATION - This will modify Firestore data${NC}"
        echo "User ID: $USER_ID"
        echo "Org ID: $ORG_ID"
        echo ""
        read -p "Are you sure you want to proceed? (yes/no): " confirm
        
        if [ "$confirm" != "yes" ]; then
            echo -e "${YELLOW}Migration cancelled${NC}"
            exit 0
        fi
        
        echo -e "${GREEN}Running migration...${NC}"
        npm run migrate:subcollections -- --userId=$USER_ID --orgId=$ORG_ID
        ;;
        
    "help"|"--help"|"-h")
        echo "Firestore Migration Helper"
        echo ""
        echo "Commands:"
        echo "  dry-run <userId> <orgId>   Test migration without making changes"
        echo "  migrate <userId> <orgId>   Run actual migration (requires confirmation)"
        echo "  help                       Show this help message"
        echo ""
        echo "See scripts/MIGRATION_README.md for detailed documentation"
        ;;
        
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo "Run './migrate.sh help' for usage"
        exit 1
        ;;
esac
